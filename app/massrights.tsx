import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text } from "react-native";
import { massachusettsTrafficScenario, RightCard } from "../data/massachusetts-traffic";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
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
    borderColor = colors.category.canDo;
  } else if (category === "cannot_do") {
    cards = massachusettsTrafficScenario.rightsCards.filter(card => card.category === 'cannot_do');
    title = "What Police Cannot Do";
    borderColor = colors.category.cannotDo;
  } else if (category === "your_rights") {
    cards = massachusettsTrafficScenario.rightsCards.filter(card => card.category === 'your_rights');
    title = "Your Rights";
    borderColor = colors.category.yourRights;
  } else if (category === "quick_phrases") {
    title = "Quick Response Phrases";
    borderColor = colors.category.quickPhrases;
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
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
  },
  header: {
    fontSize: 26,
    fontWeight: "300",
    color: colors.text.primary,
    marginTop: 5,
    marginBottom: spacing.huge,
    textAlign: "center",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.background.card,
    padding: spacing.xxl,
    borderRadius: 0,
    borderLeftWidth: 3,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "300",
    color: colors.text.primary,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  cardContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
    fontWeight: "300",
    textAlign: "justify",
  },
  legalBasis: {
    fontSize: 12,
    color: colors.text.disabled,
    fontStyle: "italic",
    fontWeight: "300",
  },
  phraseSituation: {
    fontSize: 14,
    color: colors.category.quickPhrases,
    fontWeight: "400",
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  phraseText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "300",
    marginBottom: spacing.md,
    lineHeight: 26,
  },
  phraseExplanation: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 22,
    fontWeight: "300",
    textAlign: "justify",
  },
});