import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Recording, useRecordings } from '../context/RecordingsContext';
import { ANIMATION_DURATIONS } from '../utils/animations';

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { recordings, setRecordings, addRecording, updateRecording, deleteRecording: deleteRec, isLoading } = useRecordings();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMultiActionModal, setShowMultiActionModal] = useState(false);
  const [multiActionType, setMultiActionType] = useState<'share' | 'delete' | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [renameId, setRenameId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: ANIMATION_DURATIONS.pulse,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: ANIMATION_DURATIONS.pulse,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  async function startRecording() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 0.9,
          duration: ANIMATION_DURATIONS.fast,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.fast,
          useNativeDriver: true,
        }),
      ]).start();
      
      setIsRecording(true);
      setRecordingDuration(0);
      
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setIsRecording(false);
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

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Recording error:', err);
      setIsRecording(false);
      Alert.alert("Error", "Failed to start recording.");
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 0.9,
          duration: ANIMATION_DURATIONS.fast,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATIONS.fast,
          useNativeDriver: true,
        }),
      ]).start();
      
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
        
        await addRecording(newRecording);
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

  function toggleSelectMode() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectMode(!selectMode);
    setSelectedIds(new Set());
  }

  function toggleSelection(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function openMultiShareModal() {
    if (selectedIds.size === 0) {
      Alert.alert("No Selection", "Please select at least one recording.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMultiActionType('share');
    setShowMultiActionModal(true);
  }

  function openMultiDeleteModal() {
    if (selectedIds.size === 0) {
      Alert.alert("No Selection", "Please select at least one recording.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMultiActionType('delete');
    setShowMultiActionModal(true);
  }

  async function handleMultiShare() {
    console.log("=== MULTI SHARE CALLED ===");
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMultiActionModal(false);

    try {
      const selectedRecordings = recordings.filter(r => selectedIds.has(r.id));
      
      for (const rec of selectedRecordings) {
        await Sharing.shareAsync(rec.uri, {
          mimeType: "audio/x-m4a",
          dialogTitle: `Share ${getRecordingDisplayName(rec)}`,
        });
      }
      
      setSelectMode(false);
      setSelectedIds(new Set());
      
    } catch (err: any) {
      console.error('Multi-share error:', err);
      Alert.alert("Error", "Failed to share recordings.");
    }
  }

  async function handleMultiDelete() {
    console.log("=== MULTI DELETE CALLED ===");
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMultiActionModal(false);

    try {
      if (selectedIds.has(playingId || '') && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
      }

      const updatedRecordings = recordings.filter(r => !selectedIds.has(r.id));
      setRecordings(updatedRecordings);
      
      setSelectMode(false);
      setSelectedIds(new Set());
      
    } catch (err) {
      console.error('Multi-delete error:', err);
      Alert.alert("Error", "Failed to delete recordings.");
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
    await updateRecording(renameId, { customName: renameText.trim() });
    
    setShowRenameModal(false);
    setRenameId(null);
    setRenameText("");
  }

  function openDeleteModal(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteId(id);
    setShowDeleteModal(true);
  }

  async function handleDelete() {
    if (!deleteId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setShowDeleteModal(false);
    const idToDelete = deleteId;
    setDeleteId(null);

    try {
      if (playingId === idToDelete && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
      }

      await deleteRec(idToDelete);
    } catch (err) {
      console.error('Delete error:', err);
    }
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.recordingSection}>
          <View style={styles.recordingControlArea}>
            {isRecording ? (
              <>
                <Text style={styles.recordingIndicator}>RECORDING</Text>
                <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
                <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                  <TouchableOpacity
                    style={styles.stopButtonOuter}
                    onPress={stopRecording}
                    activeOpacity={0.8}
                  >
                    <View style={styles.stopButtonInner} />
                  </TouchableOpacity>
                </Animated.View>
                <Text style={styles.stopText}>Stop</Text>
              </>
            ) : (
              <>
                <Animated.View style={{ 
                  transform: [
                    { scale: Animated.multiply(pulseAnim, buttonScaleAnim) }
                  ] 
                }}>
                  <TouchableOpacity
                    style={styles.recordButtonOuter}
                    onPress={startRecording}
                    activeOpacity={0.8}
                  >
                    <View style={styles.recordButtonInner} />
                  </TouchableOpacity>
                </Animated.View>
                <Text style={styles.tapToRecord}>Tap to Record</Text>
              </>
            )}
          </View>

          <Text style={styles.hint}>
            {isRecording 
              ? "Audio stored locally on your device" 
              : selectMode 
                ? "Tap to select recordings"
                : "Swipe Left: Rename/Delete • Swipe Right: Log Incident"}
          </Text>
        </View>

        {recordings.length > 0 && (
          <View style={styles.recordingsList}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listHeader}>
                Recordings ({recordings.length})
              </Text>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={toggleSelectMode}
                >
                  <Text style={styles.selectButtonText}>
                    {selectMode ? "Cancel" : "Select"}
                  </Text>
                </TouchableOpacity>

                {selectMode && selectedIds.size > 0 && (
                  <>
                    <TouchableOpacity
                      style={styles.headerActionButton}
                      onPress={openMultiShareModal}
                    >
                      <Text style={styles.headerActionIcon}>⤴</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.headerActionButton, styles.headerDeleteButton]}
                      onPress={openMultiDeleteModal}
                    >
                      <Text style={styles.headerActionIcon}>×</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {recordings.map((item) => (
              <RecordingItem
                key={item.id}
                item={item}
                isPlaying={playingId === item.id}
                playbackPosition={playbackPosition}
                selectMode={selectMode}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={() => toggleSelection(item.id)}
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
          animationType="none"
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
          animationType="none"
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
                  onPress={handleDelete}
                >
                  <Text style={styles.modalConfirmText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MULTI-ACTION MODAL */}
        <Modal
          visible={showMultiActionModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowMultiActionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {multiActionType === 'share' ? 'Share Recordings' : 'Delete Recordings'}
              </Text>
              <Text style={styles.modalMessage}>
                {multiActionType === 'share' 
                  ? `Share ${selectedIds.size} recording${selectedIds.size > 1 ? 's' : ''}?`
                  : `Delete ${selectedIds.size} recording${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`
                }
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowMultiActionModal(false);
                    setMultiActionType(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirm,
                    multiActionType === 'delete' && styles.modalDelete
                  ]}
                  onPress={multiActionType === 'share' ? handleMultiShare : handleMultiDelete}
                >
                  <Text style={styles.modalConfirmText}>
                    {multiActionType === 'share' ? 'Share' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function RecordingItem({ 
  item, 
  isPlaying,
  playbackPosition,
  selectMode,
  isSelected,
  onToggleSelect,
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
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
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
      <Animated.View style={{ transform: [{ translateX: trans }] }}>
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

  const content = (
    <TouchableOpacity
      style={styles.recordingCard}
      onPress={selectMode ? onToggleSelect : undefined}
      activeOpacity={selectMode ? 0.6 : 1}
    >
      {selectMode && (
        <View style={styles.checkbox}>
          <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      )}

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

      {!selectMode && (
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
      )}
    </TouchableOpacity>
  );

  if (selectMode) {
    return content;
  }

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
    >
      {content}
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
    paddingBottom: 40,
  },
  recordingSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  recordingControlArea: {
    height: 280,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 20,
  },
  recordingIndicator: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "600",
    letterSpacing: 3,
    marginBottom: 20,
  },
  timer: {
    fontSize: 50,
    color: "#ffffff",
    fontWeight: "200",
    fontVariant: ["tabular-nums"],
    marginBottom: 20,
  },
  stopButtonOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stopButtonInner: {
    width: 50,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  stopText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "300",
    letterSpacing: 1,
    marginTop: 20,  
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
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listHeader: {
    fontSize: 14,
    color: "#888888",
    fontWeight: "300",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    borderLeftWidth: 2,
    borderLeftColor: "#3498db",
  },
  selectButtonText: {
    color: "#3498db",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  headerDeleteButton: {
    backgroundColor: "rgba(231, 76, 60, 0.15)",
  },
  headerActionIcon: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "300",
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
  checkbox: {
    marginRight: 16,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#666666",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  checkboxSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
