import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function IncidentLogger() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Incident Logger</Text>
        <Text style={styles.description}>
          Document your interaction with structured questions while memory is fresh.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming Soon</Text>
          <Text style={styles.cardText}>
            Guided form to help you document encounters for official complaints or legal action.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What You'll Document</Text>
          <Text style={styles.cardText}>• Date, time, and location</Text>
          <Text style={styles.cardText}>• Officer information</Text>
          <Text style={styles.cardText}>• What was said and done</Text>
          <Text style={styles.cardText}>• Witnesses and evidence</Text>
          <Text style={styles.cardText}>• Export as PDF report</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#999999",
    marginBottom: 30,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#e74c3c",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 24,
    marginBottom: 4,
  },
});