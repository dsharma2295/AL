import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export default function Locations() {
  const [expandedTile, setExpandedTile] = useState<string | null>(null);
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

  const toggleExpand = (tileName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedTile(expandedTile === tileName ? null : tileName);
  };

  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.View
        style={[
          styles.tilesContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View>
          <TouchableOpacity
            style={[styles.mainTile, styles.trafficTile]}
            onPress={() => toggleExpand("traffic")}
          >
            <Text style={styles.mainTileText}>Traffic</Text>
            <Text style={styles.expandIndicator}>
              {expandedTile === "traffic" ? "−" : "+"}
            </Text>
          </TouchableOpacity>

          {expandedTile === "traffic" && (
            <View style={styles.expandedContent}>
              <Text style={styles.stateHeader}>Select State:</Text>
              {US_STATES.map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateOption,
                    state !== "Massachusetts" && styles.disabledState
                  ]}
                  onPress={() => {
                    if (state === "Massachusetts") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push("/massachusetts");
                    }
                  }}
                  disabled={state !== "Massachusetts"}
                >
                  <Text style={[
                    styles.stateText,
                    state !== "Massachusetts" && styles.disabledStateText
                  ]}>
                    {state}
                  </Text>
                  {state === "Massachusetts" && (
                    <Text style={styles.availableIndicator}>→</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View>
          <TouchableOpacity
            style={[styles.mainTile, styles.airportTile]}
            onPress={() => toggleExpand("airport")}
          >
            <Text style={styles.mainTileText}>Airport</Text>
            <Text style={styles.expandIndicator}>
              {expandedTile === "airport" ? "−" : "+"}
            </Text>
          </TouchableOpacity>

          {expandedTile === "airport" && (
            <View style={styles.expandedContent}>
              <TouchableOpacity
                style={[styles.subOption, styles.disabledOption]}
                disabled
              >
                <Text style={styles.disabledText}>TSA</Text>
                <Text style={styles.comingSoon}>Coming Soon</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/scenarios");
                }}
              >
                <Text style={styles.subOptionText}>CBP (Customs & Border Protection)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
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
  tilesContainer: {
    gap: 28,
    paddingBottom: spacing.xxxl,
  },
  mainTile: {
    padding: 36,
    borderRadius: 0,
    borderLeftWidth: 3,
    backgroundColor: colors.background.card,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trafficTile: {
    borderLeftColor: colors.action.danger,
  },
  airportTile: {
    borderLeftColor: colors.action.primary,
  },
  mainTileText: {
    fontSize: 21,
    fontWeight: "300",
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  expandIndicator: {
    fontSize: 32,
    color: colors.text.primary,
    fontWeight: "200",
  },
  expandedContent: {
    marginTop: spacing.lg,
    marginLeft: spacing.xl,
    gap: spacing.md,
  },
  subOption: {
    padding: spacing.xl,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftWidth: 2,
    borderLeftColor: colors.action.primary,
  },
  disabledOption: {
    opacity: 0.4,
    borderLeftColor: colors.text.disabled,
  },
  subOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "300",
  },
  disabledText: {
    fontSize: 16,
    color: colors.text.disabled,
    fontWeight: "300",
  },
  comingSoon: {
    fontSize: 12,
    color: colors.text.disabled,
    fontStyle: "italic",
    marginTop: 4,
  },
  stateHeader: {
    fontSize: 14,
    color: colors.text.disabled,
    fontWeight: "300",
    marginBottom: spacing.sm,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stateOption: {
    padding: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftWidth: 2,
    borderLeftColor: colors.action.danger,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  disabledState: {
    opacity: 0.3,
    borderLeftColor: "#444444",
  },
  stateText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: "300",
  },
  disabledStateText: {
    color: colors.text.disabled,
  },
  availableIndicator: {
    fontSize: 18,
    color: colors.action.danger,
  },
});