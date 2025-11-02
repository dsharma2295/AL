import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Massachusetts() {
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
        <CategoryCard
          title="Traffic Stop Rights"
          count="Coming Soon"
          borderColor="#e74c3c"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // router.push({ pathname: "/massrights", params: { category: "traffic_stop" } });
          }}
        />

        <CategoryCard
          title="License & Registration"
          count="Coming Soon"
          borderColor="#3498db"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Future route
          }}
        />

        <CategoryCard
          title="DUI Checkpoint"
          count="Coming Soon"
          borderColor="#f39c12"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Future route
          }}
        />

        <CategoryCard
          title="Vehicle Search Rights"
          count="Coming Soon"
          borderColor="#2ecc71"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Future route
          }}
        />
      </Animated.View>
    </ScrollView>
  );
}

function CategoryCard({ title, count, borderColor, onPress }: { title: string; count: string; borderColor: string; onPress: () => void }) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
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
    padding: 36,
    borderRadius: 0,
    borderLeftWidth: 3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  categoryTitle: {
    fontSize: 21,
    fontWeight: "300",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  categoryCount: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
});