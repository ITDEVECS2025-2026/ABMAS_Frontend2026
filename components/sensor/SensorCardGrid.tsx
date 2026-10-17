
//LAYOUT UNTUK METRIC CARD DAN YANG INI YANG DI IMPORT KE PAGE YANG DIBUTUHKAN
import React from "react";
import { Text, View } from "react-native";
import { useSensorStore } from "@/store/sensorContext";
import { Sensor } from "@/interfaces";
import MetricCard from "./SensorMetricCard";

interface SensorCardProps {
  sensorId: string;
  sensorData?: Sensor;
}

export default function SensorCard({
  sensorId,
  sensorData,
}: SensorCardProps) {
  const { sensors, connected } = useSensorStore();

  // Prioritaskan data hasil refresh dari halaman detail
  const sensor =
    sensorData ??
    sensors.find((item) => String(item.id) === String(sensorId));

  // Jika sensor belum ditemukan
  if (!sensor) {
    return (
      <View
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: 10,
          paddingHorizontal: 25,
          marginBottom: 16,
          alignItems: "center",
          justifyContent: "center",
          elevation: 3,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
        }}
      >
        <Text
          style={{
            color: "#000000",
            fontFamily: "PoppinsMedium",
            fontSize: 14,
          }}
        >
          {connected
            ? "Data sensor belum tersedia"
            : "Menghubungkan ke server..."}
        </Text>
      </View>
    );
  }

  const { soilData } = sensor;

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 4,
        marginBottom: 16,
      }}
    >
      {/* ROW 1: N, P, K */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <MetricCard type="N" value={soilData.N} />
        <MetricCard type="P" value={soilData.P} />
        <MetricCard type="K" value={soilData.K} />
      </View>

      {/* ROW 2: EC, pH */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <MetricCard type="EC" value={soilData.EC} />
        <MetricCard type="pH" value={soilData.pH} />
      </View>

      {/* ROW 3: Suhu, Kelembapan */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <MetricCard
          type="Suhu"
          value={soilData.temperature}
        />
        <MetricCard
          type="Kelembaban"
          value={soilData.humidity}
        />
      </View>
    </View>
  );
}