import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0a0a0f",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "300",
          fontSize: 16,
        },
        headerTitleAlign: "center",
        headerBackVisible: false,
        headerShadowVisible: false,
        headerLeft: ({ canGoBack }) => {
          if (!canGoBack) return null;
          
          return (
            <View style={{ paddingLeft: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                style={{ 
                  flexDirection: "row", 
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 3,
                  paddingRight: 14,
                  gap: 8,
                }}
              >
                <Text style={{ 
                  color: "#ffffff", 
                  fontSize: 22,
                  lineHeight: 22,
                  marginTop: -1,
                }}>
                  ‹
                </Text>
                <Text style={{ 
                  color: "#ffffff", 
                  fontSize: 20, 
                  fontWeight: "300",
                  letterSpacing: 1,
                  lineHeight: 20,
                }}>
                  AL
                </Text>
              </TouchableOpacity>
            </View>
          );
        },
        headerRight: () => <View style={{ width: 70 }} />,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="locations" 
        options={{ 
          headerTitle: "Where You At?",
        }} 
      />
      <Stack.Screen 
        name="scenarios" 
        options={{ 
          headerTitle: "US Airport Customs",
        }} 
      />
      <Stack.Screen 
        name="massachusetts" 
        options={{ 
          headerTitle: "Massachusetts Traffic",
        }} 
      />
      <Stack.Screen 
        name="rightscards" 
        options={{ 
          headerTitle: "",
        }} 
      />
      <Stack.Screen 
        name="audiorecorder" 
        options={{ 
          headerTitle: "Audio Recorder",
        }} 
      />
      <Stack.Screen 
        name="incidentlogger" 
        options={{ 
          headerTitle: "Incident Logger",
        }} 
      />
    </Stack>
  );
}