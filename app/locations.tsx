import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        {/* TRAFFIC TILE */}
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

        {/* AIRPORT TILE */}
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
    backgroundColor: "#0a0a0f",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 30,
  },
  tilesContainer: {
    gap: 28,
    paddingBottom: 30,
  },
  mainTile: {
    padding: 36,
    borderRadius: 0,
    borderLeftWidth: 3,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trafficTile: {
    borderLeftColor: "#e74c3c",
  },
  airportTile: {
    borderLeftColor: "#3498db",
  },
  mainTileText: {
    fontSize: 21,
    fontWeight: "300",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  expandIndicator: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "200",
  },
  expandedContent: {
    marginTop: 16,
    marginLeft: 20,
    gap: 12,
  },
  subOption: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftWidth: 2,
    borderLeftColor: "#3498db",
  },
  disabledOption: {
    opacity: 0.4,
    borderLeftColor: "#666666",
  },
  subOptionText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "300",
  },
  disabledText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "300",
  },
  comingSoon: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 4,
  },
  stateHeader: {
    fontSize: 14,
    color: "#888888",
    fontWeight: "300",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  stateOption: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftWidth: 2,
    borderLeftColor: "#e74c3c",
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
    color: "#ffffff",
    fontWeight: "300",
  },
  disabledStateText: {
    color: "#666666",
  },
  availableIndicator: {
    fontSize: 18,
    color: "#e74c3c",
  },
});