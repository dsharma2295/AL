import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

interface SavedIncident {
  id: string;
  officerInfo: string;
  location: string;
  description: string;
  audioUri?: string;
  audioFileName?: string;
  date: string;  // Changed to string
  time: string;  // Changed to string
  createdAt: Date;
}

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState<SavedIncident[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const stored = await AsyncStorage.getItem('incidents');
      if (stored) {
        const parsed = JSON.parse(stored);
        const incidents = parsed.map((inc: any) => ({
          ...inc,
          createdAt: new Date(inc.createdAt),
          // date and time are already strings from user input
        }));
        setIncidents(incidents);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  const deleteIncident = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (playingId === id && soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setPlayingId(null);
    }
    
    const updated = incidents.filter(inc => inc.id !== id);
    setIncidents(updated);
    
    try {
      await AsyncStorage.setItem('incidents', JSON.stringify(updated));
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert("Error", "Failed to delete incident.");
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete Incident",
      "Are you sure you want to delete this incident report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteIncident(id),
        },
      ]
    );
  };

  const playAudio = async (audioUri: string, incidentId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setPlayingId(incidentId);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          soundRef.current = null;
        }
      });

    } catch (err) {
      console.error('Play error:', err);
      Alert.alert("Error", "Failed to play audio.");
    }
  };

  const pauseAudio = async () => {
    if (soundRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await soundRef.current.pauseAsync();
        setPlayingId(null);
      } catch (err) {
        console.error('Pause error:', err);
      }
    }
  };

  const exportIncident = async (incident: SavedIncident) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const html = generatePDF(incident);
      const { uri } = await Print.printToFileAsync({ html });
      
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Incident Report",
      });
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert("Error", "Failed to export.");
    }
  };

  const generatePDF = (incident: SavedIncident): string => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; font-size: 12px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .label { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .content { font-size: 13px; color: #000; margin-bottom: 15px; white-space: pre-wrap; }
            .audio-badge { background: #2ecc71; color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; display: inline-block; margin-top: 5px; }
            .divider { border-top: 1px solid #ddd; margin: 20px 0; }
            .footer { font-size: 11px; color: #999; margin-top: 30px; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>INCIDENT REPORT</h1>
          <div class="subtitle">Generated by AL</div>
          <div class="divider"></div>
          
          <div class="section">
            <div class="label">OFFICER INFORMATION</div>
            <div class="content">${incident.officerInfo || 'Not provided'}</div>
          </div>
          
          <div class="section">
            <div class="label">LOCATION</div>
            <div class="content">${incident.location || 'Not provided'}</div>
          </div>
          
          <div class="section">
            <div class="label">INCIDENT DESCRIPTION</div>
            <div class="content">${incident.description || 'Not provided'}</div>
          </div>
          
          <div class="section">
            <div class="label">AUDIO EVIDENCE</div>
            <div class="content">
              ${incident.audioFileName 
                ? `<span class="audio-badge">✓ AUDIO ATTACHED</span><br/>${incident.audioFileName}` 
                : 'No audio recording attached'}
            </div>
          </div>
          
          <div class="section">
            <div class="label">DATE & TIME</div>
            <div class="content">
              Date: ${incident.date}<br/>
              Time: ${incident.time}
            </div>
          </div>
          
          <div class="divider"></div>
          <div class="footer">
            This report is for documentation purposes only.
          </div>
        </body>
      </html>
    `;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No Incidents Logged</Text>
            <Text style={styles.emptySubtext}>
              Your incident reports will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.incidentsList}>
            {incidents.map((incident) => (
              <Swipeable
                key={incident.id}
                renderRightActions={() => (
                  <TouchableOpacity 
                    style={styles.deleteAction}
                    onPress={() => confirmDelete(incident.id)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
                overshootRight={false}
              >
                <View style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentDate}>
                      {incident.date} at {incident.time}
                    </Text>
                    <Text style={styles.incidentLocation}>
                      {incident.location || 'No location'}
                    </Text>
                  </View>
                  
                  <Text style={styles.incidentPreview} numberOfLines={2}>
                    {incident.description || 'No description'}
                  </Text>

                  <View style={styles.actionRow}>
                    {incident.audioUri && (
                      <TouchableOpacity
                        style={styles.audioPlayButton}
                        onPress={() => {
                          if (playingId === incident.id) {
                            pauseAudio();
                          } else {
                            playAudio(incident.audioUri!, incident.id);
                          }
                        }}
                      >
                        <Text style={styles.audioPlayText}>
                          {playingId === incident.id ? "❚❚" : "▶"} Audio
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={styles.exportSmallButton}
                      onPress={() => exportIncident(incident)}
                    >
                      <Text style={styles.exportSmallText}>Export PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
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
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "300",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#444444",
    fontWeight: "300",
  },
  incidentsList: {
    gap: 16,
  },
  incidentCard: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
  },
  incidentHeader: {
    marginBottom: 12,
  },
  incidentDate: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "300",
    marginBottom: 4,
  },
  incidentLocation: {
    fontSize: 13,
    color: "#888888",
    fontWeight: "300",
  },
  incidentPreview: {
    fontSize: 14,
    color: "#cccccc",
    lineHeight: 20,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  audioPlayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(46, 204, 113, 0.15)",
    borderLeftWidth: 2,
    borderLeftColor: "#2ecc71",
  },
  audioPlayText: {
    color: "#2ecc71",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  exportSmallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(52, 152, 219, 0.15)",
    borderLeftWidth: 2,
    borderLeftColor: "#3498db",
  },
  exportSmallText: {
    color: "#3498db",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  deleteAction: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  deleteText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});