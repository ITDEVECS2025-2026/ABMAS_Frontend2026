import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function SoilLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(lahanbaru)" />
      <Stack.Screen name="(monitoring)" />
      <Stack.Screen name="(history)" />

      <Stack.Screen name="(sensor)" />
      <Stack.Screen name="(analisis)" />
      <Stack.Screen name="(rekomendasi)" />
      <Stack.Screen name="(setting)" />
    </Stack>
  );
}