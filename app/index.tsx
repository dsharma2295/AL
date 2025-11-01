import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AL</Text>
      <Text style={styles.subtitle}>Know Your Rights</Text>
      <Text style={styles.description}>
        Instant access to your legal rights when dealing with customs, 
        police, and government officials.
      </Text>

      <View style={styles.buttonContainer}>
        <Link href="/scenarios" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Browse Scenarios</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/audiorecorder" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Record Audio</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/incidentlogger" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Log Incident</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: 20,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: "#00d4ff",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#e8e8e8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    backgroundColor: "#0f3460",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00d4ff",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});