import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

interface Recording {
  id: string;
  uri: string;
  duration: number;
  date: Date;
}

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow microphone access.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Recording error:', err);
      Alert.alert("Error", "Failed to start recording.");
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      
      if (uri) {
        const newRecording: Recording = {
          id: Date.now().toString(),
          uri: uri,
          duration: recordingDuration,
          date: new Date(),
        };
        
        setRecordings([newRecording, ...recordings]);
      }
      
      setRecording(null);
      setRecordingDuration(0);
      
    } catch (err: any) {
      console.error('Stop error:', err);
      setIsRecording(false);
      Alert.alert("Error", "Failed to save recording.");
    }
  }

  async function playRecording(recordingItem: Recording) {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingId(null);
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: recordingItem.uri },
      { shouldPlay: true }
    );
    
    soundRef.current = sound;
    setPlayingId(recordingItem.id);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingId(null);
        soundRef.current = null;
      }
    });

  } catch (err: any) {
    console.error('Play error:', err);
    Alert.alert("Error", "Failed to play recording.");
  }
}

  async function pausePlayback() {
    if (soundRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await soundRef.current.pauseAsync();
        setPlayingId(null);
      } catch (err) {
        console.error('Pause error:', err);
      }
  }
}

  async function stopPlayback() {
    if (soundRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
      } catch (err) {
        console.error('Stop playback error:', err);
      }
    }
  }

  async function shareRecording(recordingItem: Recording) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Error", "Sharing not available");
        return;
      }

      await Sharing.shareAsync(recordingItem.uri, {
        mimeType: "audio/x-m4a",
        dialogTitle: "Share Recording",
      });
    } catch (err: any) {
      console.error('Share error:', err);
      Alert.alert("Error", "Failed to share.");
    }
  }

  function confirmDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Recording",
      "Are you sure you want to delete this recording?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Swipeable will auto-close
          }
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setRecordings(recordings.filter(r => r.id !== id));
            if (playingId === id) {
              stopPlayback();
            }
          },
        },
      ]
    );
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.recordingSection}>
          {isRecording ? (
            <View style={styles.recordingActive}>
              <View style={styles.pulsingDot} />
              <Text style={styles.recordingText}>RECORDING</Text>
              <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
              >
                <View style={styles.stopIconContainer}>
                  <View style={styles.stopIcon} />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.recordButtonContainer}
              onPress={startRecording}
              activeOpacity={0.8}
            >
              <View style={styles.recordButtonOuter}>
                <View style={styles.recordButtonInner} />
              </View>
              <Text style={styles.tapToRecord}>Tap to Record</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>
            {isRecording 
              ? "Audio stored locally on your device" 
              : "Encrypted local storage • Swipe left to delete"}
          </Text>
        </View>

        {recordings.length > 0 && (
          <View style={styles.recordingsList}>
            <Text style={styles.listHeader}>
              Recordings ({recordings.length})
            </Text>

            {recordings.map((item) => (
  <RecordingItem
    key={item.id}
    item={item}
    isPlaying={playingId === item.id}
    onPlay={() => playRecording(item)}
    onPause={() => pausePlayback()}
    onShare={() => shareRecording(item)}
    onDelete={() => confirmDelete(item.id)}
    formatDate={formatDate}
    formatDuration={formatDuration}
  />
))}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function RecordingItem({ 
  item, 
  isPlaying, 
  onPlay, 
  onPause,
  onShare, 
  onDelete, 
  formatDate, 
  formatDuration 
}: {
  item: Recording;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onShare: () => void;
  onDelete: () => void;
  formatDate: (date: Date) => string;
  formatDuration: (seconds: number) => string;
}) {
  
  const renderRightActions = () => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={onDelete}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View style={styles.recordingCard}>
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingDate}>{formatDate(item.date)}</Text>
          <Text style={styles.recordingDuration}>
            {formatDuration(item.duration)}
          </Text>
        </View>

        <View style={styles.recordingActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isPlaying ? onPause : onPlay}
          >
            <Text style={styles.actionIcon}>
              {isPlaying ? "❚❚" : "▶"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onShare}
          >
            <Text style={styles.actionIcon}>⤴</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  recordingSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  recordButtonContainer: {
    alignItems: "center",
    gap: 30,
  },
  recordButtonOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(231, 76, 60, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e74c3c",
  },
  tapToRecord: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "300",
    letterSpacing: 1,
  },
  recordingActive: {
    alignItems: "center",
    gap: 20,
    paddingVertical: 30,
  },
  pulsingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e74c3c",
  },
  recordingText: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "600",
    letterSpacing: 3,
  },
  timer: {
    fontSize: 56,
    color: "#ffffff",
    fontWeight: "200",
    fontVariant: ["tabular-nums"],
  },
  stopButton: {
    marginTop: 10,
  },
  stopIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  hint: {
    fontSize: 11,
    color: "#555555",
    marginTop: 20,
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  recordingsList: {
    gap: 12,
  },
  listHeader: {
    fontSize: 14,
    color: "#888888",
    fontWeight: "300",
    marginBottom: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  recordingCard: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordingInfo: {
    flex: 1,
  },
  recordingDate: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "300",
    marginBottom: 5,
  },
  recordingDuration: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "300",
  },
  recordingActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    fontSize: 20,
    color: "#ffffff",
  },
  deleteAction: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  deleteText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});