// app/_layout.tsx
import { Stack } from "expo-router";
import { SensorProvider } from "@/store/sensorContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SensorProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(soil)" />
        </Stack>
      </SensorProvider>
    </SafeAreaProvider>
  );
}