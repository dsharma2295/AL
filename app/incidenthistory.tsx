import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

interface SavedIncident {
  id: string;
  officerInfo: string;
  location: string;
  description: string;
  audioUri?: string;
  audioFileName?: string;
  date: string;
  time: string;
  createdAt: Date;
  editedAt?: Date;
}

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState<SavedIncident[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SavedIncident | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<SavedIncident | null>(null);
  const [editOfficerInfo, setEditOfficerInfo] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDateInput, setEditDateInput] = useState("");
  const [editSelectedTime, setEditSelectedTime] = useState(new Date());
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const stored = await AsyncStorage.getItem('incidents');
      if (stored) {
        const parsed = JSON.parse(stored);
        const incidents = parsed.map((inc: any) => ({
          ...inc,
          createdAt: new Date(inc.createdAt),
          editedAt: inc.editedAt ? new Date(inc.editedAt) : undefined,
        }));
        setIncidents(incidents);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  const saveIncidents = async (updated: SavedIncident[]) => {
    try {
      await AsyncStorage.setItem('incidents', JSON.stringify(updated));
      setIncidents(updated);
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert("Error", "Failed to save changes.");
    }
  };

  const deleteIncident = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (playingId === id && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingId(null);
    }
    
    const updated = incidents.filter(inc => inc.id !== id);
    await saveIncidents(updated);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Incident",
      "Are you sure you want to delete this incident report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteIncident(id),
        },
      ]
    );
  };

  const openEditModal = (incident: SavedIncident) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingIncident(incident);
    setEditOfficerInfo(incident.officerInfo);
    setEditLocation(incident.location);
    setEditDescription(incident.description);
    setEditDateInput(incident.date);
    
    // Parse time string to Date object
    const timeMatch = incident.time.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3];
      
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);
      setEditSelectedTime(timeDate);
    }
    
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingIncident) return;

    if (!editDateInput.trim()) {
      Alert.alert("Missing Date", "Please enter a date.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const timeStr = formatTimeDisplay(editSelectedTime);
    
    const updatedIncident: SavedIncident = {
      ...editingIncident,
      officerInfo: editOfficerInfo,
      location: editLocation,
      description: editDescription,
      date: editDateInput,
      time: timeStr,
      editedAt: new Date(),
    };

    const updated = incidents.map(inc => 
      inc.id === editingIncident.id ? updatedIncident : inc
    );

    await saveIncidents(updated);
    
    setShowEditModal(false);
    setEditingIncident(null);
  };

  const handleEditDateInput = (text: string) => {
    const numbers = text.replace(/[^\d]/g, '');
    
    let formatted = numbers;
    if (numbers.length >= 3) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2);
    }
    if (numbers.length >= 5) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    }
    
    setEditDateInput(formatted);
  };

  const formatTimeDisplay = (time: Date): string => {
    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const playAudio = async (audioUri: string, incidentId: string) => {
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
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setPlayingId(incidentId);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          soundRef.current = null;
        }
      });

    } catch (err) {
      console.error('Play error:', err);
      Alert.alert("Error", "Failed to play audio.");
    }
  };

  const pauseAudio = async () => {
    if (soundRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await soundRef.current.pauseAsync();
        setPlayingId(null);
      } catch (err) {
        console.error('Pause error:', err);
      }
    }
  };

  const openDetailsModal = (incident: SavedIncident) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

const exportIncident = async (incident: SavedIncident) => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const html = generatePDF(incident);
    const { uri } = await Print.printToFileAsync({ html });
    
    console.log("Generated PDF URI:", uri);
    
    // Generate filename from location
    const locationName = incident.location 
      ? incident.location.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') 
      : 'Incident';
    const filename = `${locationName}_Incident.pdf`;
    
    // Copy to cache with custom name
    const newUri = FileSystem.cacheDirectory + filename;
    
    console.log("Copying to:", newUri);
    
    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });
    
    console.log("Copy successful, sharing...");
    
    await Sharing.shareAsync(newUri, {
      mimeType: "application/pdf",
      dialogTitle: filename,
    });
  } catch (err: any) {
    console.error('Export error:', err);
    Alert.alert("Error", `Failed to export: ${err.message}`);
  }
};
  const generatePDF = (incident: SavedIncident): string => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 12px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .content { font-size: 13px; color: #000; margin-bottom: 15px; white-space: pre-wrap; }
            .audio-badge { background: #2ecc71; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; display: inline-block; margin-top: 5px; }
            .divider { border-top: 1px solid #ddd; margin: 20px 0; }
            .footer { font-size: 11px; color: #999; margin-top: 30px; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>INCIDENT REPORT</h1>
          <div class="subtitle">Generated by AL</div>
          <div class="divider"></div>
          
          <div class="section">
            <div class="label">OFFICER INFORMATION</div>
            <div class="content">${incident.officerInfo || 'Not provided'}</div>
          </div>
          
          <div class="section">
            <div class="label">LOCATION</div>
            <div class="content">${incident.location || 'Not provided'}</div>
          </div>
          
          <div class="section">
            <div class="label">INCIDENT DESCRIPTION</div>
            <div class="content">${incident.description || 'Not provided'}</div>
          </div>
          
          <div class="section">
            <div class="label">AUDIO EVIDENCE</div>
            <div class="content">
              ${incident.audioFileName 
                ? `<span class="audio-badge">✓ AUDIO ATTACHED</span><br/>${incident.audioFileName}` 
                : 'No audio recording attached'}
            </div>
          </div>
          
          <div class="section">
            <div class="label">DATE & TIME</div>
            <div class="content">
              ${incident.date}<br/>
              ${incident.time}
            </div>
          </div>
          
          <div class="divider"></div>
          <div class="footer">
            This report is for documentation purposes only.
          </div>
        </body>
      </html>
    `;
  };

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No Incidents Logged</Text>
            <Text style={styles.emptySubtext}>
              Your incident reports will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.incidentsList}>
            {incidents.map((incident) => (
              <Swipeable
  key={incident.id}
  renderRightActions={(progress, dragX) => {
                  const trans = dragX.interpolate({
                  inputRange: [-200, 0],
                  outputRange: [0, 200],
                  extrapolate: 'clamp',
              });

    return (
      <Animated.View style={[styles.rightActions, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity 
          style={styles.editAction}
          onPress={() => openEditModal(incident)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteAction}
          onPress={() => confirmDelete(incident.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }}
        overshootRight={false}
        overshootLeft={false}
        enabled={true}
         friction={2}
              >                
              <TouchableOpacity
                  style={styles.incidentCard}
                  onPress={() => openDetailsModal(incident)}
                  activeOpacity={0.7}
                >
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentDate}>
                      {incident.date} at {incident.time}
                    </Text>
                    {incident.editedAt && (
                      <Text style={styles.editedBadge}>
                        *Edited {formatDateTime(incident.editedAt)}
                      </Text>
                    )}
                  </View>
                  
                  <Text style={styles.incidentLocation} numberOfLines={1}>
                    {incident.location || 'No location'}
                  </Text>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </View>
        )}

        {/* DETAILS MODAL */}
        <Modal
          visible={showDetailsModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              <ScrollView>
                <Text style={styles.detailsTitle}>Incident Details</Text>
                
                {selectedIncident && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>OFFICER INFORMATION</Text>
                      <Text style={styles.detailContent}>
                        {selectedIncident.officerInfo || 'Not provided'}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>LOCATION</Text>
                      <Text style={styles.detailContent}>
                        {selectedIncident.location || 'Not provided'}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>DESCRIPTION</Text>
                      <Text style={styles.detailContent}>
                        {selectedIncident.description || 'Not provided'}
                      </Text>
                    </View>

                    {selectedIncident.audioUri && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>AUDIO EVIDENCE</Text>
                        <View style={styles.audioPlayerRow}>
                          <Text style={styles.audioFileName} numberOfLines={1}>
                            {selectedIncident.audioFileName || 'Audio Recording'}
                          </Text>
                          <TouchableOpacity
                            style={styles.audioPlayButton}
                            onPress={() => {
                              if (playingId === selectedIncident.id) {
                                pauseAudio();
                              } else {
                                playAudio(selectedIncident.audioUri!, selectedIncident.id);
                              }
                            }}
                          >
                            <Text style={styles.audioPlayIcon}>
                              {playingId === selectedIncident.id ? "❚❚" : "▶"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>DATE & TIME</Text>
                      <Text style={styles.detailContent}>
                        {selectedIncident.date}
                      </Text>
                      <Text style={styles.detailContent}>
                        {selectedIncident.time}
                      </Text>
                    </View>

                    {selectedIncident.editedAt && (
                      <Text style={styles.editedFooter}>
                        Last edited: {formatDateTime(selectedIncident.editedAt)}
                      </Text>
                    )}
                  </>
                )}
              </ScrollView>

              <View style={styles.detailsActions}>
                <TouchableOpacity
                  style={styles.detailsExportButton}
                  onPress={() => {
                    if (selectedIncident) {
                      exportIncident(selectedIncident);
                    }
                  }}
                >
                  <Text style={styles.detailsExportText}>Export PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailsCloseButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowDetailsModal(false);
                    setSelectedIncident(null);
                  }}
                >
                  <Text style={styles.detailsCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* EDIT MODAL */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowEditModal(false)}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.editModalContent}>
              <ScrollView>
                <Text style={styles.detailsTitle}>Edit Incident</Text>

                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>OFFICER INFORMATION</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder="Name, Badge #, Employee ID, or Department"
                    placeholderTextColor="#555555"
                    value={editOfficerInfo}
                    onChangeText={setEditOfficerInfo}
                    multiline
                  />
                </View>

                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>LOCATION</Text>
                  <TextInput
                    style={styles.editInput}
                    placeholder="e.g., Logan Airport Terminal E"
                    placeholderTextColor="#555555"
                    value={editLocation}
                    onChangeText={setEditLocation}
                    multiline
                  />
                </View>

                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>DESCRIPTION</Text>
                  <TextInput
                    style={[styles.editInput, styles.editTextArea]}
                    placeholder="Describe the incident..."
                    placeholderTextColor="#555555"
                    value={editDescription}
                    onChangeText={setEditDescription}
                    multiline
                    numberOfLines={6}
                  />
                </View>

                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>DATE & TIME</Text>
                  
                  <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeInputContainer}>
                      <Text style={styles.dateTimeLabel}>DATE</Text>
                      <TextInput
                        style={styles.dateTimeInput}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#555555"
                        value={editDateInput}
                        onChangeText={handleEditDateInput}
                        keyboardType="number-pad"
                        maxLength={10}
                      />
                    </View>
                    
                    <View style={styles.dateTimeInputContainer}>
                      <Text style={styles.dateTimeLabel}>TIME</Text>
                      <TouchableOpacity
                        style={styles.timePickerButton}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setShowEditTimePicker(true);
                        }}
                      >
                        <Text style={styles.dateTimeInput}>
                          {formatTimeDisplay(editSelectedTime)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showEditTimePicker && (
                    <Modal transparent visible={showEditTimePicker}>
                      <View style={styles.timePickerModal}>
                        <View style={styles.timePickerContainer}>
                          <DateTimePicker
                            value={editSelectedTime}
                            mode="time"
                            display="spinner"
                            onChange={(event, time) => {
                              if (time) {
                                setEditSelectedTime(time);
                              }
                            }}
                          />
                          <TouchableOpacity
                            style={styles.timePickerDone}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setShowEditTimePicker(false);
                            }}
                          >
                            <Text style={styles.timePickerDoneText}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  )}
                </View>
              </ScrollView>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.editCancelButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowEditModal(false);
                    setEditingIncident(null);
                  }}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editSaveButton}
                  onPress={saveEdit}
                >
                  <Text style={styles.editSaveText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 30,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "300",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#444444",
    fontWeight: "300",
  },
  incidentsList: {
    gap: 20,
  },
  incidentCard: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
    height: 120,
    justifyContent: "center",
  },
  incidentHeader: {
    marginBottom: 15,
  },
  incidentDate: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "300",
    marginBottom: 4,
  },
  editedBadge: {
    fontSize: 10,
    color: "#f39c12",
    fontWeight: "500",
    fontStyle: "italic",
  },
  incidentLocation: {
    fontSize: 15,
    color: "#888888",
    fontWeight: "300",
  },
rightActions: {
  flexDirection: "row",
},
  editAction: {
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
  actionText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  editModalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxHeight: "85%",
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: "#888888",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  detailContent: {
    fontSize: 14,
    color: "#ffffff",
    lineHeight: 22,
    fontWeight: "300",
  },
  audioPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#2ecc71",
  },
  audioFileName: {
    flex: 1,
    fontSize: 13,
    color: "#2ecc71",
    fontWeight: "300",
  },
  audioPlayButton: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(46, 204, 113, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  audioPlayIcon: {
    fontSize: 18,
    color: "#2ecc71",
  },
  editedFooter: {
    fontSize: 11,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
  detailsActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  detailsExportButton: {
    flex: 1,
    padding: 14,
    backgroundColor: "#3498db",
    alignItems: "center",
  },
  detailsExportText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  detailsCloseButton: {
    flex: 1,
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  detailsCloseText: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "300",
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: "300",
    color: "#888888",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  editInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
    padding: 12,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "300",
    minHeight: 45,
  },
  editTextArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeInputContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
    padding: 12,
  },
  dateTimeLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "300",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateTimeInput: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  timePickerButton: {
    paddingVertical: 4,
  },
  timePickerModal: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  timePickerContainer: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  timePickerDone: {
    padding: 16,
    backgroundColor: "#2ecc71",
    alignItems: "center",
  },
  timePickerDoneText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  editCancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  editCancelText: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "300",
  },
  editSaveButton: {
    flex: 1,
    padding: 14,
    backgroundColor: "#2ecc71",
    alignItems: "center",
  },
  editSaveText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});