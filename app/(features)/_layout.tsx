import { Stack } from "expo-router";
import { SensorProvider } from "@/store/sensorContext";

export default function FeaturesLayout() {
  return (
    <SensorProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SensorProvider>
  );
}