import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ANIMATION_DURATIONS } from '../utils/animations';

export default function Scenarios() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View 
        style={[
          styles.cardsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <CategoryCard
          title="What CBP Can Do"
          count="5 items"
          borderColor="#2ecc71"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/rightscards", params: { category: "can_do" } });
          }}
        />

        <CategoryCard
          title="What CBP Cannot Do"
          count="5 items"
          borderColor="#e74c3c"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/rightscards", params: { category: "cannot_do" } });
          }}
        />

        <CategoryCard
          title="Your Rights"
          count="6 items"
          borderColor="#3498db"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/rightscards", params: { category: "your_rights" } });
          }}
        />

        <CategoryCard
          title="Quick Response Phrases"
          count="6 phrases"
          borderColor="#f39c12"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/rightscards", params: { category: "quick_phrases" } });
          }}
        />
      </Animated.View>
    </ScrollView>
  );
}

function CategoryCard({ title, count, borderColor, onPress }: { title: string; count: string; borderColor: string; onPress: () => void }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  const springConfig = getSpringConfig();
  Animated.spring(scaleValue, {
    toValue: 0.97,
    ...springConfig,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  const springConfig = getSpringConfig();
  Animated.spring(scaleValue, {
    toValue: 1,
    ...springConfig,
    useNativeDriver: true,
  }).start();
};

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.categoryCard,
          { borderLeftColor: borderColor, transform: [{ scale: scaleValue }] },
        ]}
      >
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryCount}>{count}</Text>
      </Animated.View>
    </TouchableOpacity>
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
  categoryCard: {
    padding: 40,
    borderRadius: 0,
    borderLeftWidth: 3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  categoryTitle: {
    fontSize: 25,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  categoryCount: {
    fontSize: 15,
    color: "#666666",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
});