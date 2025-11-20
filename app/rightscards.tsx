import { BlurView } from 'expo-blur';
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import type { RightCard } from "../data/customs-rights";
import { customsScenario } from "../data/customs-rights";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";


export default function RightsCards() {
  const params = useLocalSearchParams();
  const category = params.category as string;
  const [selectedCard, setSelectedCard] = useState<RightCard | null>(null);
  const [bookmarkedCards, setBookmarkedCards] = useState<Set<string>>(new Set());
  const [swipedCardId, setSwipedCardId] = useState<string | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const cards = customsScenario.rightsCards.filter(
    (card) => card.category === category
  );

  const priorityOrder = { critical: 1, important: 2, info: 3 };
  const sortedCards = [...cards].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const openCard = (card: RightCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCard(card);
  };

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCard(null);
  };

  const openLegalBasis = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Cannot Open Link", "Unable to open this legal document.");
    }
  };

  const copyToClipboard = async (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Content copied to clipboard");
  };

  const toggleBookmark = (cardId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newBookmarks = new Set(bookmarkedCards);
    if (newBookmarks.has(cardId)) {
      newBookmarks.delete(cardId);
    } else {
      newBookmarks.add(cardId);
    }
    setBookmarkedCards(newBookmarks);
  };

  const handleLogIncident = (cardTitle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/incidentlogger",
      params: {
        prefilledDescription: `Violation: ${cardTitle}`,
      },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return colors.priority.critical;
      case "important": return colors.priority.important;
      case "info": return colors.priority.info;
      default: return colors.priority.info;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical": return "CRITICAL";
      case "important": return "IMPORTANT";
      case "info": return "INFO";
      default: return "";
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case "can_do": return colors.category.canDo;
      case "cannot_do": return colors.category.cannotDo;
      case "your_rights": return colors.category.yourRights;
      default: return colors.category.yourRights;
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case "can_do": return "What CBP Can Do";
      case "cannot_do": return "What CBP Cannot Do";
      case "your_rights": return "Your Rights";
      default: return "Rights";
    }
  };

  const renderLeftActions = (card: RightCard, progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 120],
      outputRange: [-120, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.swipeActionContainer,
          { transform: [{ translateX: trans }] }
        ]}
      >
        <TouchableOpacity
          style={styles.logIncidentAction}
          onPress={() => handleLogIncident(card.title)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>Log Incident</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCard = (card: RightCard) => {
    const borderColor = getCategoryColor();
    const priorityColor = getPriorityColor(card.priority);
    const isBookmarked = bookmarkedCards.has(card.id);
    const isSwiped = swipedCardId === card.id;

    return (
      <Swipeable
        key={card.id}
        ref={(ref) => { swipeableRefs.current[card.id] = ref; }}
        renderLeftActions={(progress, dragX) => renderLeftActions(card, progress, dragX)}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableWillOpen={() => {
          Object.keys(swipeableRefs.current).forEach(key => {
            if (key !== card.id && swipeableRefs.current[key]) {
              swipeableRefs.current[key]?.close();
            }
          });
          setSwipedCardId(card.id);
        }}
        onSwipeableClose={() => setSwipedCardId(null)}
      >
        <TouchableOpacity
          style={[
            styles.card,
            {
              borderLeftColor: borderColor,
              borderLeftWidth: 4
            }
          ]}
          onPress={() => openCard(card)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.priorityBadge}>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {getPriorityLabel(card.priority)}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardSummary}>{card.summary}</Text>
          <Text style={styles.tapHint}>Tap to read more ▼</Text>

          {!isSwiped && (
            <View style={styles.cardIcons}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  copyToClipboard(card.content);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ marginTop: 5 }}
              >
                <Text style={styles.iconText}>⧉</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark(card.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.iconText}>{isBookmarked ? "★" : "☆"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getCategoryTitle()}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedCards.map(renderCard)}
          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal
          visible={selectedCard !== null}
          transparent={true}
          animationType="none"
          onRequestClose={closeModal}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeModal}
          >
            <BlurView
              intensity={40}
              tint="dark"
              style={[
                styles.modal,
                {
                  borderLeftColor: selectedCard ? getCategoryColor() : colors.category.yourRights,
                },
              ]}
            >
              {selectedCard && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.priorityBadge}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(selectedCard.priority) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(selectedCard.priority) },
                        ]}
                      >
                        {getPriorityLabel(selectedCard.priority)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalTitle}>{selectedCard.title}</Text>
                  <Text style={styles.modalContent}>{selectedCard.content}</Text>

                  <View style={styles.legalBasisSection}>
                    <Text style={styles.legalBasisLabel}>LEGAL BASIS</Text>
                    {selectedCard.legalBasisUrl ? (
                      <TouchableOpacity
                        onPress={() => openLegalBasis(selectedCard.legalBasisUrl!)}
                      >
                        <Text style={styles.legalBasisLink}>
                          {selectedCard.legalBasis}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.legalBasisText}>
                        {selectedCard.legalBasis}
                      </Text>
                    )}
                  </View>

                  <View style={styles.modalIcons}>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(selectedCard.content)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={{ marginTop: 5 }}
                    >
                      <Text style={styles.iconText}>⧉</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleBookmark(selectedCard.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.iconText}>
                        {bookmarkedCards.has(selectedCard.id) ? "★" : "☆"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </BlurView>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 5,
    borderBottomWidth: 10,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    paddingRight: 70,
    paddingBottom: 40,
    marginBottom: spacing.xl,
    position: "relative",
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 18,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: 10,
  },
  cardSummary: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 18,
  },
  tapHint: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  cardIcons: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
  },
  iconText: {
    fontSize: 25,
    color: colors.text.tertiary,
  },
  swipeActionContainer: {
    marginBottom: spacing.xl,
  },
  logIncidentAction: {
    backgroundColor: colors.category.quickPhrases,
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    height: '100%',
    paddingHorizontal: spacing.xl,
  },
  actionText: {
    color: colors.text.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',  // Darken from 0.5 to 0.7
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modal: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',  // Adjust transparency
    padding: spacing.xxl,
    width: "90%",
    maxHeight: "75%",
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  modalHeader: {
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    lineHeight: 28,
    marginBottom: spacing.lg,
  },
  modalContent: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  legalBasisSection: {
    marginBottom: spacing.xl,
  },
  legalBasisLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  legalBasisLink: {
    fontSize: 14,
    color: colors.action.primary,
    lineHeight: 20,
  },
  legalBasisText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  modalIcons: {
    flexDirection: "row",
    gap: spacing.lg,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});