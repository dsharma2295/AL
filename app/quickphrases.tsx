import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { customsScenario } from "../data/customs-rights";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function QuickPhrases() {
  const phrases = customsScenario.quickPhrases;
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<Set<string>>(new Set());

  const copyPhrase = async (phrase: string, situation: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Clipboard.setStringAsync(phrase);
    Alert.alert("Copied", "Phrase copied to clipboard");
  };

  const toggleBookmark = (phraseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newBookmarks = new Set(bookmarkedPhrases);
    if (newBookmarks.has(phraseId)) {
      newBookmarks.delete(phraseId);
    } else {
      newBookmarks.add(phraseId);
    }
    setBookmarkedPhrases(newBookmarks);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quick Response Phrases</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Polite, legally-informed phrases to assert rights without escalating encounters.
          </Text>
        </View>

        {phrases.map((item) => {
          const isBookmarked = bookmarkedPhrases.has(item.id);

          return (
            <View key={item.id} style={styles.phraseCard}>
              <Text style={styles.situation}>{item.situation}</Text>

              <View style={styles.phraseBox}>
                <Text style={styles.phrase}>"{item.phrase}"</Text>
              </View>

              <Text style={styles.explanation}>{item.explanation}</Text>

              <View style={styles.cardIcons}>
                <TouchableOpacity
                  onPress={() => copyPhrase(item.phrase, item.situation)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ marginTop: 5 }}
                >
                  <Text style={styles.iconText}>⧉</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleBookmark(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.iconText}>{isBookmarked ? "★" : "☆"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 50,
    paddingBottom: 5,
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
  introCard: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 0,
    borderLeftColor: colors.background.primary,
  },
  introText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 25,
    textAlign: "center",
  },
  phraseCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    paddingRight: 70,
    paddingBottom: 40,
    marginBottom: spacing.xl,
    borderLeftWidth: 0,
    borderLeftColor: colors.category.quickPhrases,
    position: "relative",
  },
  situation: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: spacing.lg,
    lineHeight: 30,
    textAlign: "center",
    paddingLeft: 45,
  },
  phraseBox: {
    backgroundColor: "rgba(243, 156, 18, 0.1)",
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: colors.category.quickPhrases,
    borderRightColor: colors.category.quickPhrases,
    width: "120%",
  },
  phrase: {
    fontSize: 15,
    color: colors.category.quickPhrases,
    lineHeight: 22,
    fontStyle: "italic",
  },
  explanation: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  cardIcons: {
    position: "absolute",
    bottom: 11,
    right: spacing.md,
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center",
  },
  iconText: {
    fontSize: 25,
    color: colors.text.tertiary,
  },
});