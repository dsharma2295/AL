import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AL</Text>
        <Text style={styles.banner}>Know Your Rights</Text>
      </View>
      
      <View style={styles.buttonContainer}>
      <Link href="/locations" asChild>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Where You At?</Text>
        </TouchableOpacity>
        </Link>

        <Link href="/incidentlogger" asChild>
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
});