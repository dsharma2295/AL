import { StyleSheet, Text, View } from "react-native";

export default function Scenarios() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>US Airport Customs</Text>
      <Text style={styles.description}>
        Know your rights when entering the United States
      </Text>
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: "#e8e8e8",
    textAlign: "center",
  },
});