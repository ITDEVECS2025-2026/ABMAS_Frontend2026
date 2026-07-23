import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";

import { useSensorStore } from "@/store/sensorContext";
import ScreenHeader from "../../components/ui/ScreenHeader";
import SensorCard from "@/components/sensor/SensorCardGrid";
import AddLahanCard from "@/components/form/AddlahanCard";

export default function MonitoringPage() {
  const [namaLahan, setNamaLahan] = useState("");
  const { sensors, connected } = useSensorStore();

  // Ambil sensor pertama
  const sensor = sensors[0];

  function handleTambah() {
    // TODO: panggil services/lahanService.ts -> saveLahan()
    console.log("Simpan lahan:", namaLahan);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
    >
      <ScreenHeader title="Sensor 1" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontFamily: "PoppinsBold",
            marginTop: 40,
            textAlign: "center",
          }}
        >
          Monitoring
        </Text>

        {sensor && (
          <View
            style={{
              width: "100%",
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ marginBottom: 8 }}>{sensor.name}</Text>

            <SensorCard sensorId={sensor.id} />

            <AddLahanCard
              value={namaLahan}
              onChangeText={setNamaLahan}
              onSubmit={handleTambah}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}