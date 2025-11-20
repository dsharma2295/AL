import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function Settings() {
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const name = await AsyncStorage.getItem("emergency_contact_name");
      const phone = await AsyncStorage.getItem("emergency_contact_phone");

      if (name) setEmergencyName(name);
      if (phone) setEmergencyPhone(phone);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmergencyContact = async () => {
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      Alert.alert("Required", "Please enter both name and phone number.");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await AsyncStorage.setItem("emergency_contact_name", emergencyName.trim());
      await AsyncStorage.setItem("emergency_contact_phone", emergencyPhone.trim());
      Alert.alert("Saved", "Emergency contact saved successfully.");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save emergency contact.");
    }
  };

  const clearAllRecordings = () => {
    Alert.alert(
      "Clear All Recordings",
      "This will permanently delete all audio recordings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await AsyncStorage.setItem("recordings", JSON.stringify([]));
              Alert.alert("Deleted", "All recordings have been deleted.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete recordings.");
            }
          },
        },
      ]
    );
  };

  const clearAllIncidents = () => {
    Alert.alert(
      "Clear All Incidents",
      "This will permanently delete all logged incidents. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await AsyncStorage.setItem("incidents", JSON.stringify([]));
              Alert.alert("Deleted", "All incidents have been deleted.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete incidents.");
            }
          },
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete ALL app data including recordings, incidents, bookmarks, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await AsyncStorage.clear();
              Alert.alert("Cleared", "All app data has been deleted.");
              setEmergencyName("");
              setEmergencyPhone("");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              placeholderTextColor={colors.text.disabled}
              value={emergencyName}
              onChangeText={setEmergencyName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={colors.text.disabled}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveEmergencyContact}
          >
            <Text style={styles.saveButtonText}>Save Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={clearAllRecordings}
          >
            <Text style={styles.dangerButtonText}>Clear All Recordings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={clearAllIncidents}
          >
            <Text style={styles.dangerButtonText}>Clear All Incidents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dangerButton, styles.criticalButton]}
            onPress={clearAllData}
          >
            <Text style={styles.dangerButtonText}>Clear All App Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Purpose</Text>
            <Text style={styles.infoText}>
              AL helps you understand and exercise your legal rights during encounters with law enforcement and government officials.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Legal Disclaimer</Text>
            <Text style={styles.infoText}>
              This app provides general legal information only. It is not legal advice and does not create an attorney-client relationship. Consult a licensed attorney for specific legal guidance.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.huge,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.disabled,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.text.disabled,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.background.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.action.primary,
    padding: spacing.lg,
    color: colors.text.primary,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftWidth: 3,
    borderLeftColor: colors.action.success,
    padding: spacing.lg,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.action.success,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dangerButton: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.action.danger,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  criticalButton: {
    backgroundColor: "rgba(231, 76, 60, 0.2)",
  },
  dangerButtonText: {
    color: colors.action.danger,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: colors.background.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.text.disabled,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.disabled,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "300",
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});