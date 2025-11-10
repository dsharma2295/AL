import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text } from "react-native";
import { massachusettsTrafficScenario, RightCard } from "../data/massachusetts-traffic";
import { ANIMATION_DURATIONS } from '../utils/animations';

export default function MassRights() {
  const { category } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  let cards: RightCard[] = [];
  let title = "";
  let borderColor = "";

  if (category === "can_do") {
    cards = massachusettsTrafficScenario.rightsCards.filter(card => card.category === 'can_do');
    title = "What Police Can Do";
    borderColor = "#2ecc71";
  } else if (category === "cannot_do") {
    cards = massachusettsTrafficScenario.rightsCards.filter(card => card.category === 'cannot_do');
    title = "What Police Cannot Do";
    borderColor = "#e74c3c";
  } else if (category === "your_rights") {
    cards = massachusettsTrafficScenario.rightsCards.filter(card => card.category === 'your_rights');
    title = "Your Rights";
    borderColor = "#3498db";
  } else if (category === "quick_phrases") {
    title = "Quick Response Phrases";
    borderColor = "#f39c12";
  }

  useEffect(() => {
Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: ANIMATION_DURATIONS.slow,
    useNativeDriver: true,
  }),
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: ANIMATION_DURATIONS.slow,
    useNativeDriver: true,
  }),
]).start();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Animated.Text 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {title}
      </Animated.Text>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {category === "quick_phrases" ? (
          massachusettsTrafficScenario.quickPhrases.map((phrase) => (
            <Animated.View
              key={phrase.id}
              style={[
                styles.card,
                { borderLeftColor: borderColor },
              ]}
            >
              <Text style={styles.phraseSituation}>{phrase.situation}</Text>
              <Text style={styles.phraseText}>"{phrase.phrase}"</Text>
              <Text style={styles.phraseExplanation}>{phrase.explanation}</Text>
            </Animated.View>
          ))
        ) : (
          cards.map((card) => (
            <Animated.View
              key={card.id}
              style={[
                styles.card,
                { borderLeftColor: borderColor },
              ]}
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardContent}>{card.content}</Text>
              <Text style={styles.legalBasis}>Legal Basis: {card.legalBasis}</Text>
            </Animated.View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "300",
    color: "#ffffff",
    marginTop: 5,
    marginBottom: 40,
    textAlign: "center",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 24,
    borderRadius: 0,
    borderLeftWidth: 3,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  cardContent: {
    fontSize: 14,
    color: "#cccccc",
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "300",
    textAlign: "justify",
  },
  legalBasis: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    fontWeight: "300",
  },
  phraseSituation: {
    fontSize: 14,
    color: "#f39c12",
    fontWeight: "400",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  phraseText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "300",
    marginBottom: 12,
    lineHeight: 26,
  },
  phraseExplanation: {
    fontSize: 13,
    color: "#999999",
    lineHeight: 22,
    fontWeight: "300",
    textAlign: "justify",
  },
});