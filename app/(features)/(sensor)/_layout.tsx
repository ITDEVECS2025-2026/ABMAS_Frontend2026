// app/(features)/(sensor)/_layout.tsx
import { Stack } from "expo-router";
import { SensorProvider } from "@/store/sensorContext"; // Sesuaikan path import foldernya jika berbeda

export default function SensorLayout() {
  return (
    <SensorProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[id]" />
      </Stack>
    </SensorProvider>
  );
}