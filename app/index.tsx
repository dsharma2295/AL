import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Starfield from "../components/Starfield";
import { colors } from "../theme/colors"; // ← ADD THIS
import { spacing } from "../theme/spacing"; // ← ADD THIS
export default function Index() {
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosMessage, setSOSMessage] = useState("Emergency - check on me");

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const openSOSModal = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Check if emergency contact is set
    const name = await AsyncStorage.getItem("emergency_contact_name");
    const phone = await AsyncStorage.getItem("emergency_contact_phone");

    if (!name || !phone) {
      Alert.alert(
        "No Emergency Contact",
        "Please set up your emergency contact in Settings first.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Settings",
            onPress: () => router.push("/settings")
          }
        ]
      );
      return;
    }

    setShowSOSModal(true);
  };

  const handleCall = async () => {
    try {
      const phone = await AsyncStorage.getItem("emergency_contact_phone");
      if (phone) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setShowSOSModal(false);
        Linking.openURL(`tel:${phone}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to initiate call");
    }
  };

  const handleMessage = async () => {
    try {
      const phone = await AsyncStorage.getItem("emergency_contact_phone");
      if (phone) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setShowSOSModal(false);
        Linking.openURL(`sms:${phone}&body=${encodeURIComponent(sosMessage)}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  return (
    <View style={styles.container}>
      <Starfield count={100} />
      <View style={styles.header}>
        <Text style={styles.title}>AL</Text>
        <Text style={styles.banner}>Know Your Rights</Text>
      </View>

      {/* ADD THIS - Settings Icon */}
      <TouchableOpacity
        style={styles.settingsIcon}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/settings");
        }}
      >
        <Text style={styles.gearIcon}>⚙</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <Link href="/locations" asChild>
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Where You At?</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/incidenthub" asChild>
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Log Incident</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/audiorecorder" asChild>
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Record Audio</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* FLOATING ICONS */}
      <View style={styles.floatingIcons}>
        {/* BOOKMARKS - Bottom Left */}
        <TouchableOpacity
          style={[styles.floatingButton, styles.floatingLeft]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/bookmarks");
          }}
        >
          <Text style={styles.floatingIcon}>★</Text>
        </TouchableOpacity>

        {/* SOS - Bottom Right */}
        <TouchableOpacity
          style={[styles.floatingButton, styles.floatingRight]}
          onPress={openSOSModal}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* SOS MODAL */}
      <Modal
        visible={showSOSModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSOSModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Contact</Text>

            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>Message to send:</Text>
              <Text style={styles.messageText}>"{sosMessage}"</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.callButton]}
                onPress={handleCall}
              >
                <Text style={styles.modalButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.messageButton]}
                onPress={handleMessage}
              >
                <Text style={styles.modalButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowSOSModal(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.massive,
  },
  title: {
    fontSize: 72,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: "300",
    letterSpacing: 8,
  },
  banner: {
    fontSize: 16,
    color: colors.text.disabled,
    fontWeight: "300",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: colors.background.card,
    padding: 28,
    width: 300,
    alignItems: "center",
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.text.primary,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  floatingIcons: {
    position: "absolute",
    bottom: spacing.huge,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingLeft: {
    backgroundColor: "rgba(241, 196, 15, 0.15)",
    borderColor: "#f1c40f",
  },
  floatingRight: {
    backgroundColor: "rgba(231, 76, 60, 0.15)",
    borderColor: colors.action.danger,
  },
  floatingIcon: {
    fontSize: 28,
    color: "#f1c40f",
  },
  sosText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.action.danger,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    padding: spacing.xxl,
    width: "90%",
    borderLeftWidth: 4,
    borderLeftColor: colors.action.danger,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  messageBox: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderLeftWidth: 2,
    borderLeftColor: colors.action.danger,
  },
  messageLabel: {
    fontSize: 12,
    color: colors.text.disabled,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    color: colors.text.primary,
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.lg,
    alignItems: "center",
    borderLeftWidth: 2,
  },
  callButton: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftColor: colors.action.success,
  },
  messageButton: {
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    borderLeftColor: colors.action.primary,
  },
  modalButtonText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cancelButton: {
    padding: spacing.lg,
    alignItems: "center",
    backgroundColor: colors.background.card,
  },
  cancelButtonText: {
    color: colors.text.disabled,
    fontSize: 15,
    fontWeight: "300",
  },
  settingsIcon: {
    position: "absolute",
    top: spacing.massive,
    right: spacing.md,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gearIcon: {
    fontSize: 24,
    color: colors.text.tertiary,
  },
});