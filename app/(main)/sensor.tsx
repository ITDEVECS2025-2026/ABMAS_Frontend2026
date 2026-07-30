import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import MetricCard from "@/components/sensor/SensorMetricCard"; // sesuaikan path aslinya
import StatusSensorCard from "@/components/sensor/StatusSensorCard";
import MapView, { Marker } from "react-native-maps";

type SensorDetail = {
  id: string;
  name: string;
  kondisiTanah: {
    n: number; p: number; k: number;
    ec: number; ph: number; suhu: number; kelembaban: number;
  };
  status: {
    battery: number;
    batteryHealth: string;
    loraStatus: string;
    gpsConnected: boolean;
    lastUpdatedTimestamp: number;
  };
  lokasi: {
    alamat: string;
    latitude: number;
    longitude: number;
  };
};

export default function SensorPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<SensorDetail | null>(null);

  useEffect(() => {
    // TODO: ganti dengan fetch API asli berdasarkan id
    setData({
      id: id ?? "1",
      name: `Sensor ${id}`,
      kondisiTanah: { n: 100, p: 100, k: 100, ec: 100, ph: 100, suhu: 100, kelembaban: 100 },
      status: {
        battery: 100,
        batteryHealth: "Baik",
        loraStatus: "Aktif",
        gpsConnected: true,
        lastUpdatedTimestamp: Date.now() - 2 * 60 * 1000, // 2 menit lalu
      },
      lokasi: {
        alamat: "Surabaya, Sukolilo, Jawa Timur",
        latitude: -7.281,
        longitude: 112.796,
      },
    });
  }, [id]);

  if (!data) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title={data.name} />

      <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16, paddingTop: 16 }}>
        <SectionHeader title="Kondisi Tanah" subtitle="Pembaruan terakhir : 2 menit lalu" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <MetricCard type="N" value={data.kondisiTanah.n} />
          <MetricCard type="P" value={data.kondisiTanah.p} />
          <MetricCard type="K" value={data.kondisiTanah.k} />
          <MetricCard type="EC" value={data.kondisiTanah.ec} />
          <MetricCard type="pH" value={data.kondisiTanah.ph} />
          <MetricCard type="Suhu" value={data.kondisiTanah.suhu} />
          <MetricCard type="Kelembaban" value={data.kondisiTanah.kelembaban} />
        </View>

        <StatusSensorCard
          battery={data.status.battery}
          batteryHealth={data.status.batteryHealth}
          loraStatus={data.status.loraStatus}
          gpsActive={data.status.gpsConnected}
          lastUpdated={data.status.lastUpdatedTimestamp}
        />

        <SectionHeader title="Lokasi Sawah" />
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" }}>
          <MapView
            style={{ width: "100%", height: 160 }}
            initialRegion={{
              latitude: data.lokasi.latitude,
              longitude: data.lokasi.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker coordinate={{ latitude: data.lokasi.latitude, longitude: data.lokasi.longitude }} />
          </MapView>
        </View>
      </ScrollView>
    </View>
  );
}