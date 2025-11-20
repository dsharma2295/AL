import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from 'expo-blur';
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
interface Recording {
  id: string;
  uri: string;
  duration: number;
  date: Date;
  customName?: string;
}

interface SavedIncident {
  id: string;
  officerInfo: string;
  location: string;
  description: string;
  audioId?: string;
  audioUri?: string;
  audioFileName?: string;
  date: string;
  time: string;
  createdAt: Date;
}

export default function IncidentLogger() {
  const [officerInfo, setOfficerInfo] = useState("");
  const [location, setLocation] = useState("");
  const [selectedAudio, setSelectedAudio] = useState<Recording | undefined>(undefined);
  const [availableRecordings, setAvailableRecordings] = useState<Recording[]>([]);
  const [showAudioPicker, setShowAudioPicker] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateError, setDateError] = useState("");

  const params = useLocalSearchParams();
  const [description, setDescription] = useState(
    params.prefilledDescription ? String(params.prefilledDescription) : ""
  );

  useEffect(() => {
    loadRecordings();

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

    if (isNaN(month) || month < 1 || month > 12) {
      setDateError("Month must be between 01-12");
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2020 || year > currentYear) {
      setDateError(`Year must be between 2020-${currentYear}`);
      return false;
    }

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
      audioId: selectedAudio?.id,
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
            placeholderTextColor={colors.text.disabled}
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
            placeholderTextColor={colors.text.disabled}
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
            placeholderTextColor={colors.text.disabled}
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
            <BlurView intensity={40} tint="dark" style={styles.modalContent}>
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
            </BlurView>
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
                placeholderTextColor={colors.text.disabled}
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
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.huge,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "300",
    color: colors.text.disabled,
    marginBottom: spacing.md,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.background.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.action.primary,
    padding: spacing.lg,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "300",
    minHeight: 50,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  attachButton: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.action.success,
    alignItems: "center",
  },
  attachButtonText: {
    color: colors.action.success,
    fontSize: 14,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  attachedAudioContainer: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: colors.action.success,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attachedAudioText: {
    color: colors.action.success,
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
    color: colors.action.danger,
    fontSize: 20,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: 'rgba(10, 10, 15, 0.6)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.xl,
    maxHeight: "70%",
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "300",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.xl,
    letterSpacing: 1,
  },
  recordingsList: {
    maxHeight: 300,
    paddingHorizontal: spacing.xl,
  },
  noRecordings: {
    color: colors.text.disabled,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: spacing.huge,
    fontWeight: "300",
  },
  recordingOption: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.action.success,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordingDate: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "300",
  },
  recordingDuration: {
    color: colors.text.disabled,
    fontSize: 13,
  },
  modalCloseButton: {
    padding: spacing.xl,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    marginTop: 10,
  },
  modalCloseText: {
    color: colors.text.disabled,
    fontSize: 15,
    fontWeight: "300",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dateTimeInputContainer: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.action.primary,
    padding: spacing.lg,
  },
  dateTimeLabel: {
    color: colors.text.disabled,
    fontSize: 12,
    fontWeight: "300",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateTimeInput: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  dateTimeInputError: {
    color: colors.action.danger,
    borderBottomWidth: 2,
    borderBottomColor: colors.action.danger,
  },
  errorText: {
    color: colors.action.danger,
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
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.xl,
    borderRadius: 12,
    overflow: "hidden",
  },
  timePickerDone: {
    padding: spacing.lg,
    backgroundColor: colors.action.success,
    alignItems: "center",
  },
  timePickerDoneText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxxl,
  },
  backButton: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.text.disabled,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.text.disabled,
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  saveButton: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: colors.action.success,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftColor: "#444444",
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  saveButtonTextDisabled: {
    color: colors.text.disabled,
  },
});