// app/(features)/(main)/monitoring.tsx
import React from "react";
import { View, Pressable, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const sensors = [
  { id: "0", name: "Sensor 1" },
  { id: "1", name: "Sensor 2" },
  { id: "2", name: "Sensor 3" },
  { id: "3", name: "Sensor 4" },
  { id: "4", name: "Sensor 5" },
];

export default function MonitoringPage() {
  const router = useRouter();

  const handlePressSensor = (id: string) => {
    router.push({
      pathname: "/(features)/(sensor)/[id]",
      params: { id },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title="Monitoring Tanah" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
        <SectionHeader title="Daftar Sensor" />

        <View style={{ gap: 10 }}>
          {sensors.map((sensor) => (
            <Pressable key={sensor.id} onPress={() => handlePressSensor(sensor.id)}>
              <LinearGradient
                colors={["#105C2E", "#2C8A40"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 48,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "PoppinsBold",
                    fontSize: 16,
                  }}
                >
                  {sensor.name}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}