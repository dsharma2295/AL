import { Stack } from "expo-router";

export default function RootLayout() {
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
        headerLeft: () => null,
        headerRight: () => null,
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
        name="incidenthub" 
        options={{ 
          headerTitle: "Incident Logger",
        }} 
      />
      <Stack.Screen 
        name="incidentlogger" 
        options={{ 
          headerTitle: "Log Incident",
        }} 
      />
      <Stack.Screen 
        name="incidenthistory" 
        options={{ 
          headerTitle: "Incident History",
        }} 
      />
    </Stack>
  );
}