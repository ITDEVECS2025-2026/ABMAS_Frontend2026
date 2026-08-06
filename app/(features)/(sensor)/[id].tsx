import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlaskConical,
  Leaf,
  MapPin,
  Pencil,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import SensorCard from "@/components/sensor/SensorCardGrid";
import StatusSensorCard from "@/components/sensor/StatusSensorCard";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useSensorStore } from "@/store/sensorContext";
import { getTimeAgo } from "@/utils/gps";
import { scale } from "@/utils/scale";

const CARD_WIDTH = 336; // lebar seragam untuk semua section (samakan dengan Lokasi Sawah)

export default function SensorDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();
  const { getSensorById } = useSensorStore();

  const sensor = getSensorById(id);

  if (!sensor) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ScreenHeader title="Sensor" />
        <Text style={{ textAlign: "center", marginTop: 40, fontFamily: "PoppinsMedium" }}>
          Sensor tidak ditemukan
        </Text>
      </SafeAreaView>
    );
  }


  const hasLocation =
    !!sensor.location && sensor.location.latitude !== 0 && sensor.location.longitude !== 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title={sensor.name} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: scale(40),
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= Kondisi Tanah ================= */}
        <View style={{ width: scale(CARD_WIDTH), marginTop: scale(16), alignItems: "center" }}>
          <View style={{ flexDirection: "row", gap: scale(8) }}>
            <Leaf size={scale(28.254)} color="#232323" />
            <Text
              style={{
                color: "#232323",
                fontFamily: "PoppinsBold",
                fontSize: scale(21.085),
              }}
            >
              Kondisi Tanah
            </Text>
          </View>
          <Text
            style={{
              color: "#232323",
              fontFamily: "PoppinsMedium",
              fontSize: scale(12.651),
              marginTop: scale(-4),
              marginLeft: scale(2),
            }}
          >
            Pembaruan terakhir : {getTimeAgo(sensor.lastUpdated)}
          </Text>
        </View>

        <SensorCard sensorId={sensor.id} />

        {/* ================= Rekomendasi Pupuk ================= */}
        <View style={{ alignItems: "center", width: "100%", paddingHorizontal: scale(15) }}>
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.6, y: 1 }}
            style={{
              width: "100%",
              height: scale(70),
              borderTopLeftRadius: scale(16.868),
              borderTopRightRadius: scale(16.868),
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8) }}>
              <FlaskConical size={scale(23)} color="#FFFFFF" style={{ marginTop: scale(-4) }} />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "PoppinsBold",
                  fontSize: scale(21.085),
                }}
              >
                Rekomendasi Pupuk
              </Text>
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "PoppinsMedium",
                fontSize: scale(12.651),
                marginTop: scale(-7),
              }}
            >
              Pembaruan terakhir : {getTimeAgo(sensor.lastUpdated)}
            </Text>
          </LinearGradient>

          <View
            style={{
              width: "100%",
              paddingVertical: scale(15),
              borderBottomLeftRadius: scale(8.434),
              borderBottomRightRadius: scale(8.434),
              backgroundColor: "#BDEBBB",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(features)/(varietas)/[id]",
                  params: {
                    id,
                    namaLahan: params.namaLahan ?? "",
                    tanaman: params.tanaman ?? "",
                    tanggalTanam: params.tanggalTanam ?? "",
                    luasLahan: params.luasLahan ?? "",
                    targetPanen: params.targetPanen ?? "",
                    alamat: params.alamat ?? "",
                    lat: params.lat ?? "",
                    lon: params.lon ?? "",
                  },
                } as any)
              }
              style={{
                width: scale(310),
                height: scale(53.134),
                borderRadius: scale(21.085),
                borderWidth: scale(2.108),
                borderColor: "#1E1E1E",
                backgroundColor: "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: scale(8),
              }}
            >
              <Pencil size={scale(24.459)} color="#105C2E" />
              <Text
                style={{
                  color: "#105C2E",
                  fontFamily: "PoppinsBold",
                  fontSize: scale(21.085),
                }}
              >
                Isi Data Pupuk
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ================= Status Sensor ================= */}
        <View style={{ marginTop: scale(24) }}>
          <StatusSensorCard
            battery={sensor.status.battery}
            batteryHealth={sensor.status.batteryHealth}
            loraStatus={sensor.status.loraStatus}
            gpsActive={hasLocation}
            lastUpdated={sensor.lastUpdated}
          />
        </View>

        {/* ================= Lokasi Sawah ================= */}
        <View style={{ marginTop: scale(24), marginBottom: scale(20), width: scale(CARD_WIDTH) }}>
          <View
            style={{
              width: "100%",
              borderRadius: scale(6.05),
              borderWidth: scale(0.403),
              borderColor: "#006134",
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#105C2E", "#8C6A09"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1.6, y: 1 }}
              style={{
                width: "100%",
                height: scale(47),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: scale(8),
              }}
            >
              <MapPin size={scale(20)} color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  textAlign: "center",
                  fontFamily: "PoppinsBold",
                  fontSize: scale(18),
                }}
              >
                Lokasi Sawah
              </Text>
            </LinearGradient>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: scale(8),
                paddingHorizontal: scale(12),
                paddingVertical: scale(10),
              }}
            >
              <MapPin size={scale(30)} color="#006134" />
              <View style={{ flex: 1 }}>
                {hasLocation ? (
                  <>
                    <Text
                      style={{
                        color: "#1A202C",
                        fontFamily: "PoppinsSemiBold",
                        fontSize: scale(13),
                      }}
                    >
                      {sensor.location!.latitude.toFixed(6)}, {sensor.location!.longitude.toFixed(6)}
                    </Text>
                    <Text
                      style={{
                        color: "#4A5468",
                        fontFamily: "PoppinsMedium",
                        fontStyle: "italic",
                        fontSize: scale(11.5),
                        marginTop: scale(-2),
                      }}
                    >
                      Diperbarui: {getTimeAgo(sensor.location!.timestamp)}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={{
                      color: "#4A5468",
                      fontFamily: "PoppinsRegular",
                      fontStyle: "italic",
                      fontSize: scale(13),
                    }}
                  >
                    Lokasi belum tersedia dari sensor
                  </Text>
                )}
              </View>
            </View>

            {hasLocation && (
              <View
                style={{
                  width: "100%",
                  height: scale(156),
                  borderTopWidth: scale(0.403),
                  borderTopColor: "#006134",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <MapView
                  style={{ width: "100%", height: "100%" }}
                  mapType="none"
                  region={{
                    latitude: sensor.location!.latitude,
                    longitude: sensor.location!.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <UrlTile
                    urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                    maximumZ={19}
                  />
                  <Marker
                    coordinate={{
                      latitude: sensor.location!.latitude,
                      longitude: sensor.location!.longitude,
                    }}
                  />
                </MapView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

