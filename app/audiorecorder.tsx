import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

interface Recording {
  id: string;
  uri: string;
  duration: number;
  date: Date;
  customName?: string;
}

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadRecordingsFromStorage();
  }, []);

  const loadRecordingsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('recordings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const loadedRecordings = parsed.map((rec: any) => ({
          ...rec,
          date: new Date(rec.date),
        }));
        setRecordings(loadedRecordings);
      }
    } catch (err) {
      console.error('Load recordings error:', err);
    }
  };

  const saveRecordingsToStorage = async (updatedRecordings: Recording[]) => {
    try {
      await AsyncStorage.setItem('recordings', JSON.stringify(updatedRecordings));
    } catch (err) {
      console.error('Save recordings error:', err);
    }
  };

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
        
        const updatedRecordings = [newRecording, ...recordings];
        setRecordings(updatedRecordings);
        await saveRecordingsToStorage(updatedRecordings);
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
        setPlaybackPosition(0);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingItem.uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.isPlaying) {
            const positionSeconds = Math.floor(status.positionMillis / 1000);
            setPlaybackPosition(positionSeconds);
          }
          
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
            soundRef.current = null;
            setPlaybackPosition(0);
          }
        }
      );
      
      soundRef.current = sound;
      setPlayingId(recordingItem.id);

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
        setPlaybackPosition(0);
      } catch (err) {
        console.error('Pause error:', err);
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

  function openRenameModal(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const rec = recordings.find(r => r.id === id);
    setRenameId(id);
    setRenameText(rec?.customName || "");
    setShowRenameModal(true);
  }

  async function saveRename() {
    if (!renameId || !renameText.trim()) {
      Alert.alert("Invalid Name", "Please enter a name for the recording.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updatedRecordings = recordings.map(rec => {
      if (rec.id === renameId) {
        return { ...rec, customName: renameText.trim() };
      }
      return rec;
    });

    setRecordings(updatedRecordings);
    await saveRecordingsToStorage(updatedRecordings);
    
    setShowRenameModal(false);
    setRenameId(null);
    setRenameText("");
  }

  function openDeleteModal(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteId(id);
    setShowDeleteModal(true);
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
              : "Swipe right: Rename/Delete • Swipe left: Log Incident"}
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
                playbackPosition={playbackPosition}
                onPlay={() => {
                  if (playingId === item.id) {
                    pausePlayback();
                  } else {
                    playRecording(item);
                  }
                }}
                onShare={() => shareRecording(item)}
                onRename={() => openRenameModal(item.id)}
                onDelete={() => openDeleteModal(item.id)}
                onLogIncident={() => logIncidentWithAudio(item)}
                getDisplayName={getRecordingDisplayName}
                formatDuration={formatDuration}
              />
            ))}
          </View>
        )}

        {/* RENAME MODAL */}
        <Modal
          visible={showRenameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRenameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename Recording</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter name (e.g., Officer Smith)"
                placeholderTextColor="#666666"
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveRename}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowRenameModal(false);
                    setRenameText("");
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={saveRename}
                >
                  <Text style={styles.modalConfirmText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DELETE MODAL */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Recording</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete this recording? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirm, styles.modalDelete]}
                  onPress={deleteRecording}
                >
                  <Text style={styles.modalConfirmText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </GestureHandlerRootView>
  );

  async function deleteRecording() {
    if (!deleteId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (playingId === deleteId && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingId(null);
    }

    const updatedRecordings = recordings.filter(r => r.id !== deleteId);
    setRecordings(updatedRecordings);
    await saveRecordingsToStorage(updatedRecordings);
    
    setShowDeleteModal(false);
    setDeleteId(null);
  }

function logIncidentWithAudio(recordingItem: Recording) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  const displayName = getRecordingDisplayName(recordingItem);
  
  router.push({
    pathname: "/incidentlogger",
    params: {
      audioId: recordingItem.id,
      audioUri: recordingItem.uri,
      audioName: displayName,
      audioDuration: recordingItem.duration.toString(),
    }
  });
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

  function getRecordingDisplayName(rec: Recording): string {
    if (rec.customName) {
      const dateStr = rec.date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
      const timeStr = rec.date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).replace(/\s/g, '');
      return `${rec.customName}_${dateStr}_${timeStr}`;
    }
    return formatDate(rec.date);
  }
}

function RecordingItem({ 
  item, 
  isPlaying,
  playbackPosition,
  onPlay, 
  onShare,
  onRename,
  onDelete,
  onLogIncident,
  getDisplayName,
  formatDuration
}: {
  item: Recording;
  isPlaying: boolean;
  playbackPosition: number;
  onPlay: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  onLogIncident: () => void;
  getDisplayName: (rec: Recording) => string;
  formatDuration: (seconds: number) => string;
}) {
  
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
  const trans = dragX.interpolate({
    inputRange: [-200, 0],
    outputRange: [0, 200],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.rightActions, 
        { transform: [{ translateX: trans }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.renameAction}
        onPress={onRename}
      >
        <Text style={styles.actionText}>Rename</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={onDelete}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
  const trans = dragX.interpolate({
    inputRange: [0, 120],
    outputRange: [-120, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={{ transform: [{ translateX: trans }] }}
    >
      <TouchableOpacity 
        style={styles.logIncidentAction}
        onPress={onLogIncident}
        activeOpacity={0.8}
      >
        <Text style={styles.actionText}>Log Incident</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      <View style={styles.recordingCard}>
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingDate}>{getDisplayName(item)}</Text>
          {isPlaying ? (
            <Text style={styles.playbackTimer}>
              {formatDuration(playbackPosition)} / {formatDuration(item.duration)}
            </Text>
          ) : (
            <Text style={styles.recordingDuration}>
              {formatDuration(item.duration)}
            </Text>
          )}
        </View>

        <View style={styles.recordingActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPlay}
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
  playbackTimer: {
    fontSize: 13,
    color: "#2ecc71",
    fontWeight: "500",
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
  rightActions: {
    flexDirection: "row",
  },
  renameAction: {
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  deleteAction: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
logIncidentAction: {
  backgroundColor: "#f39c12",
  justifyContent: "center",
  alignItems: "center",
  width: 120,
  height: '100%',
  paddingHorizontal: 20,
},
  actionText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 1,
  },
  modalMessage: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
    padding: 16,
    color: "#ffffff",
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "300",
  },
  modalConfirm: {
    flex: 1,
    padding: 14,
    backgroundColor: "#3498db",
    alignItems: "center",
  },
  modalDelete: {
    backgroundColor: "#e74c3c",
  },
  modalConfirmText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});