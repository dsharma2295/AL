import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
          <View style={styles.modalContent}>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 72,
    color: "#ffffff",
    marginBottom: 15,
    fontWeight: "300",
    letterSpacing: 8,
  },
  banner: {
    fontSize: 16,
    color: "#888888",
    fontWeight: "300",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 28,
    width: 300,
    alignItems: "center",
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#ffffff",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  floatingIcons: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
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
  },
  floatingLeft: {
    backgroundColor: "rgba(241, 196, 15, 0.15)",
    borderColor: "#f1c40f",
  },
  floatingRight: {
    backgroundColor: "rgba(231, 76, 60, 0.15)",
    borderColor: "#e74c3c",
  },
  floatingIcon: {
    fontSize: 28,
    color: "#f1c40f",
  },
sosText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#e74c3c",
  letterSpacing: 1,
},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    padding: 24,
    width: "90%",
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  messageBox: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 2,
    borderLeftColor: "#e74c3c",
  },
  messageLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 15,
    color: "#fff",
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 2,
  },
  callButton: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftColor: "#2ecc71",
  },
  messageButton: {
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    borderLeftColor: "#3498db",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cancelButtonText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "300",
  },
  settingsIcon: {
  position: "absolute",
  top: 60,
  right: 15,
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
},
gearIcon: {
  fontSize: 24,
  color: "rgba(255, 255, 255, 0.3)",
},
});