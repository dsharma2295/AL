import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function IncidentHub() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View 
        style={[
          styles.cardsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[styles.card, styles.logNowCard]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/incidentlogger");
          }}
        >
          <Text style={styles.cardTitle}>Log Now</Text>
          <Text style={styles.cardSubtext}>Document a new incident</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.historyCard]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/incidenthistory");
          }}
        >
          <Text style={styles.cardTitle}>Incident History</Text>
          <Text style={styles.cardSubtext}>View past reports</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
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
  cardsContainer: {
    gap: 28,
    paddingBottom: 30,
  },
  card: {
    padding: 36,
    borderRadius: 0,
    borderLeftWidth: 3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  logNowCard: {
    borderLeftColor: "#e74c3c",
  },
  historyCard: {
    borderLeftColor: "#3498db",
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  cardSubtext: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "300",
  },
});