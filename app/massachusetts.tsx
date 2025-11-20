import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { ANIMATION_DURATIONS, getSpringConfig } from "../utils/animations";

export default function Massachusetts() {
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
          title="What Police Can Do"
          count="5 items"
          borderColor={colors.category.canDo}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/massrights", params: { category: "can_do" } });
          }}
        />

        <CategoryCard
          title="What Police Cannot Do"
          count="5 items"
          borderColor={colors.category.cannotDo}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/massrights", params: { category: "cannot_do" } });
          }}
        />

        <CategoryCard
          title="Your Rights"
          count="7 items"
          borderColor={colors.category.yourRights}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/massrights", params: { category: "your_rights" } });
          }}
        />

        <CategoryCard
          title="Quick Response Phrases"
          count="6 phrases"
          borderColor={colors.category.quickPhrases}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/massrights", params: { category: "quick_phrases" } });
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
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  cardsContainer: {
    gap: 28,
    paddingBottom: spacing.xxxl,
  },
  categoryCard: {
    padding: 36,
    borderRadius: 0,
    borderLeftWidth: 3,
    backgroundColor: colors.background.card,
  },
  categoryTitle: {
    fontSize: 21,
    fontWeight: "300",
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.text.disabled,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
});