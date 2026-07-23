// app/(soil)/(sensor)/_layout.tsx
import { Stack } from "expo-router";

export default function SensorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}