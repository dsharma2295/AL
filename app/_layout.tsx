import { Stack } from "expo-router";
import { RecordingsProvider } from "../context/RecordingsContext";

export default function RootLayout() {
return (
    <RecordingsProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#000",
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
            headerShown: false
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
      <Stack.Screen 
        name="massrights" 
        options={{ 
          headerTitle: "",
        }} 
      />
      <Stack.Screen 
  name="quickphrases" 
  options={{ 
    headerShown: false
  }} 
      />
      <Stack.Screen 
  name="settings" 
  options={{ 
    headerShown: false
  }} 
/>
    </Stack>
  </RecordingsProvider>
  );
}