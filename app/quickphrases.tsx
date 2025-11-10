import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { customsScenario } from "../data/customs-rights";

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
    backgroundColor: "#000",
  },
  header: {
  paddingHorizontal: 20,
  paddingTop: 50,       // Increase top padding significantly
  paddingBottom: 5,
  borderBottomWidth: 10,
  borderBottomColor: "rgba(255, 255, 255, 0.1)",
},
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  introCard: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 0,
    borderLeftColor: "#000000ff",
  },
  introText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 25,
    textAlign: "center",
  },
  phraseCard: {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  padding: 16,
  paddingRight: 70,      // Add this
  paddingBottom: 40,     // Add this
  marginBottom: 20,
  borderLeftWidth: 0,
  borderLeftColor: "#f39c12",
  position: "relative",
},
  situation: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    lineHeight: 30,
    textAlign: "center",
     paddingLeft: 45,
  },
 phraseBox: {
  backgroundColor: "rgba(243, 156, 18, 0.1)",  // ORANGE tint (was green)
  padding: 12,
  marginBottom: 16,
  borderLeftWidth: 2,
  borderRightWidth: 2,
  borderLeftColor: "#f39c12",  // ORANGE
  borderRightColor: "#f39c12",
  width: "120%",  // Extend beyond card width
},
phrase: {
  fontSize: 15,
  color: "#f39c12",  // ORANGE (was green)
  lineHeight: 22,
  fontStyle: "italic",
},
  explanation: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    lineHeight: 19,
    marginBottom: 12,
  },
cardIcons: {
  position: "absolute",
  bottom: 11,
  right: 12,
  flexDirection: "row",
  gap: 16,
  alignItems: "center",  // Add this
},
  iconText: {
    fontSize: 25,
    color: "rgba(255, 255, 255, 0.5)",
  },
});