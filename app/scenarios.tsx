import { BlurView } from 'expo-blur';
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { ANIMATION_DURATIONS, getSpringConfig } from "../utils/animations";
export default function Scenarios() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const infoButtonScale = useRef(new Animated.Value(1)).current;
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  const openInfoModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.timing(infoButtonScale, {
        toValue: 0.85,
        duration: ANIMATION_DURATIONS.fast,
        useNativeDriver: true,
      }),
      Animated.timing(infoButtonScale, {
        toValue: 1,
        duration: ANIMATION_DURATIONS.fast,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setShowInfoModal(true), 150);
  };

  return (
    <View style={{ flex: 1 }}>
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
            borderColor={colors.category.canDo}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/rightscards", params: { category: "can_do" } });
            }}
          />

          <CategoryCard
            title="What CBP Cannot Do"
            count="5 items"
            borderColor={colors.category.cannotDo}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/rightscards", params: { category: "cannot_do" } });
            }}
          />

          <CategoryCard
            title="Your Rights"
            count="6 items"
            borderColor={colors.category.yourRights}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/rightscards", params: { category: "your_rights" } });
            }}
          />

          <CategoryCard
            title="Quick Response Phrases"
            count="6 phrases"
            borderColor={colors.category.quickPhrases}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/quickphrases");
            }}
          />
        </Animated.View>
      </ScrollView>

      <Animated.View style={{
        position: "absolute",
        bottom: 55,
        right: 25,
        transform: [{ scale: infoButtonScale }]
      }}>
        <TouchableOpacity
          style={styles.floatingInfoButton}
          onPress={openInfoModal}
          activeOpacity={0.8}
        >
          <Text style={styles.infoIcon}>i</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showInfoModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalContent}>
            <Text style={styles.modalTitle}>What is CBP?</Text>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>AGENCY</Text>
                <Text style={styles.infoText}>
                  U.S. Customs and Border Protection
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>PART OF</Text>
                <Text style={styles.infoText}>
                  Department of Homeland Security (DHS)
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>MISSION</Text>
                <Text style={styles.infoText}>
                  Protect America's borders, prevent terrorists and weapons from entering the United States, and facilitate legitimate travel and trade.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>WHERE YOU ENCOUNTER THEM</Text>
                <Text style={styles.infoText}>
                  At airports, seaports, and land border crossings when entering or leaving the United States. CBP officers staff 328 ports of entry nationwide.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>AUTHORITY</Text>
                <Text style={styles.infoText}>
                  CBP has broad powers at the border including warrantless searches of baggage and electronic devices. The Fourth Amendment's normal protections are reduced at ports of entry under the "border search exception."
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>SIZE</Text>
                <Text style={styles.infoText}>
                  Largest federal law enforcement agency in DHS with over 58,000 employees including 33,300 officers at ports of entry.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>ESTABLISHED</Text>
                <Text style={styles.infoText}>
                  2003 - Formed by merging U.S. Customs Service, Immigration and Naturalization Service inspectors, and agricultural inspectors.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowInfoModal(false);
              }}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </Modal>
    </View>
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
    paddingBottom: 100,
  },
  cardsContainer: {
    gap: 28,
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
  floatingInfoButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.action.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoIcon: {
    fontSize: 30,
    color: colors.text.primary,
    fontWeight: "600",
    fontFamily: "Georgia",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Changed
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: 'rgba(26, 26, 26, 0.6)',  // Changed
    borderRadius: 12,
    padding: spacing.xxl,
    width: "90%",
    maxHeight: "80%",
    overflow: 'hidden',  // Add
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "300",
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: "center",
    letterSpacing: 1,
  },
  modalScroll: {
    maxHeight: 400,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.action.primary,
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    fontWeight: "300",
  },
  modalCloseButton: {
    padding: spacing.lg,
    backgroundColor: colors.action.primary,
    alignItems: "center",
    marginTop: spacing.xl,
    borderRadius: 4,
  },
  modalCloseText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});