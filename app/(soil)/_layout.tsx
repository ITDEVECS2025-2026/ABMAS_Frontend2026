// app/(soil)/_layout.tsx
import { Stack } from "expo-router";

export default function SoilLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(sensor)" />
      <Stack.Screen name="(analisis)" />
      <Stack.Screen name="(rekomendasi)" />
    </Stack>
  );
}