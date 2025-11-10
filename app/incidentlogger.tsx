import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useRecordings } from '../context/RecordingsContext';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


interface Recording {
  id: string;
  uri: string;
  duration: number;
  date: Date;
  customName?: string;  // Add this
}


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
}

export default function IncidentLogger() {
  const [officerInfo, setOfficerInfo] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAudio, setSelectedAudio] = useState<Recording | undefined>(undefined);
  const [availableRecordings, setAvailableRecordings] = useState<Recording[]>([]);
  const [showAudioPicker, setShowAudioPicker] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateError, setDateError] = useState("");

const params = useLocalSearchParams();

useEffect(() => {
  loadRecordings();
  
  // Check if audio was pre-attached from Audio Recorder
  if (params.audioId && params.audioUri && params.audioName && params.audioDuration) {
    const preAttachedAudio: Recording = {
      id: params.audioId as string,
      uri: params.audioUri as string,
      duration: parseInt(params.audioDuration as string),
      date: new Date(),
      customName: params.audioName as string,
    };
    setSelectedAudio(preAttachedAudio);
  }
}, []);


  const loadRecordings = async () => {
    try {
      const stored = await AsyncStorage.getItem('recordings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const recordings = parsed.map((rec: any) => ({
          ...rec,
          date: new Date(rec.date),
        }));
        setAvailableRecordings(recordings);
      }
    } catch (err) {
      console.error('Load recordings error:', err);
    }
  };

  const validateDate = (dateStr: string): boolean => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;

    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    // Validate month (01-12)
    if (isNaN(month) || month < 1 || month > 12) {
      setDateError("Month must be between 01-12");
      return false;
    }

    // Validate year (2020-current year)
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2020 || year > currentYear) {
      setDateError(`Year must be between 2020-${currentYear}`);
      return false;
    }

    // Validate day based on month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (isNaN(day) || day < 1 || day > daysInMonth) {
      setDateError(`Invalid day for this month (max: ${daysInMonth})`);
      return false;
    }

    setDateError("");
    return true;
  };

  const handleDateInput = (text: string) => {
    const numbers = text.replace(/[^\d]/g, '');
    
    let formatted = numbers;
    if (numbers.length >= 3) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2);
    }
    if (numbers.length >= 5) {
      formatted = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
    }
    
    setDateInput(formatted);

    // Validate if complete
    if (numbers.length === 8) {
      validateDate(formatted);
    } else {
      setDateError("");
    }
  };

  const formatTimeDisplay = (): string => {
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const saveIncident = async () => {
    if (!officerInfo.trim() && !location.trim() && !description.trim()) {
      Alert.alert("Missing Information", "Please fill in at least one field.");
      return;
    }

    if (!dateInput.trim() || dateError) {
      Alert.alert("Invalid Date", dateError || "Please enter a valid date.");
      return;
    }

    const incident: SavedIncident = {
      id: Date.now().toString(),
      officerInfo,
      location,
      description,
      audioUri: selectedAudio?.uri,
      audioFileName: selectedAudio ? (selectedAudio.customName || `Recording from ${formatDateTime(selectedAudio.date)}`) : undefined,
      date: dateInput,
      time: formatTimeDisplay(),
      createdAt: new Date(),
    };

    try {
      const stored = await AsyncStorage.getItem('incidents');
      const incidents = stored ? JSON.parse(stored) : [];
      incidents.unshift(incident);
      await AsyncStorage.setItem('incidents', JSON.stringify(incidents));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        "Incident Logged Successfully",
        "Check the Incident History to view your report.",
        [
          { 
            text: "OK", 
            onPress: () => {
              setOfficerInfo("");
              setLocation("");
              setDescription("");
              setSelectedAudio(undefined);
              setDateInput("");
              setSelectedTime(new Date());
              setDateError("");
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert("Error", "Failed to save incident.");
    }
  };

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

const getAudioDisplayText = (audio: Recording): string => {
  if (audio.customName) {
    return audio.customName;
  }
  return formatDateTime(audio.date);
};

  const removeAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAudio(undefined);
  };

  const isFormValid = !dateError && dateInput.length === 10;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Officer Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Name, Badge #, Employee ID, or Department"
            placeholderTextColor="#555555"
            value={officerInfo}
            onChangeText={setOfficerInfo}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Logan Airport Terminal E, I-90 Exit 24"
            placeholderTextColor="#555555"
            value={location}
            onChangeText={setLocation}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happened?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the incident in detail..."
            placeholderTextColor="#555555"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={8}
          />
          
          {selectedAudio ? (
            <View style={styles.attachedAudioContainer}>
              <Text style={styles.attachedAudioText}>
                Audio: {selectedAudio.customName || formatDateTime(selectedAudio.date)}
              </Text>
              <TouchableOpacity 
                style={styles.removeAudioButton}
                onPress={removeAudio}
              >
                <Text style={styles.removeAudioText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                loadRecordings();
                setShowAudioPicker(true);
              }}
            >
              <Text style={styles.attachButtonText}>
                + Attach Audio Recording
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal
          visible={showAudioPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAudioPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Recording</Text>
              
              <ScrollView style={styles.recordingsList}>
                {availableRecordings.length === 0 ? (
                  <Text style={styles.noRecordings}>
                    No recordings available. Record audio first.
                  </Text>
                ) : (
                  availableRecordings.map((rec) => (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recordingOption}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedAudio(rec);
                        setShowAudioPicker(false);
                      }}
                    >
                      <Text style={styles.recordingDate}>
  {rec.customName || formatDateTime(rec.date)}
</Text>
                      <Text style={styles.recordingDuration}>
                        {formatDuration(rec.duration)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAudioPicker(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeInputContainer}>
              <Text style={styles.dateTimeLabel}>DATE</Text>
              <TextInput
                style={[
                  styles.dateTimeInput,
                  dateError && styles.dateTimeInputError
                ]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#555555"
                value={dateInput}
                onChangeText={handleDateInput}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="next"
              />
              {dateError ? (
                <Text style={styles.errorText}>{dateError}</Text>
              ) : null}
            </View>
            
            <View style={styles.dateTimeInputContainer}>
              <Text style={styles.dateTimeLabel}>TIME</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.dateTimeInput}>
                  {formatTimeDisplay()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

{showTimePicker && (
  <Modal transparent visible={showTimePicker}>
    <View style={styles.timePickerModal}>
      <View style={styles.timePickerContainer}>
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="spinner"
          onChange={(event, time) => {
            if (time) {
              setSelectedTime(time);
            }
            // DON'T close here - only close on Done button
          }}
        />
        <TouchableOpacity
          style={styles.timePickerDone}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowTimePicker(false);
          }}
        >
          <Text style={styles.timePickerDoneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            onPress={saveIncident}
            disabled={!isFormValid}
          >
            <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "300",
    color: "#888888",
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
    padding: 16,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "300",
    minHeight: 50,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  attachButton: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
    alignItems: "center",
  },
  attachButtonText: {
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  attachedAudioContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attachedAudioText: {
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  removeAudioButton: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(231, 76, 60, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  removeAudioText: {
    color: "#e74c3c",
    fontSize: 20,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0a0a0f",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "300",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1,
  },
  recordingsList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  noRecordings: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 40,
    fontWeight: "300",
  },
  recordingOption: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordingDate: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "300",
  },
  recordingDuration: {
    color: "#666666",
    fontSize: 13,
  },
  modalCloseButton: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    marginTop: 10,
  },
  modalCloseText: {
    color: "#888888",
    fontSize: 15,
    fontWeight: "300",
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
    padding: 16,
  },
  dateTimeLabel: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "300",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateTimeInput: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  dateTimeInputError: {
    color: "#e74c3c",
    borderBottomWidth: 2,
    borderBottomColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "300",
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 30,
  },
  backButton: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#666666",
    alignItems: "center",
  },
  backButtonText: {
    color: "#888888",
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: "#2ecc71",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftColor: "#444444",
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  saveButtonTextDisabled: {
    color: "#666666",
  },
});