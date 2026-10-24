import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Leaf,
  MapPin,
  RefreshCcw,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

import InputSensorIdCard from "@/components/form/InputSensorIdCard";
import SensorCard from "@/components/sensor/SensorCardGrid";
import StatusSensorCard from "@/components/sensor/StatusSensorCard";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Sensor } from "@/interfaces";
import { fetchInitialSensors } from "@/lib/api";
import { useSensorStore } from "@/store/sensorContext";
import { getTimeAgo } from "@/utils/gps";
import { scale } from "@/utils/scale";

const CARD_WIDTH = 336;

// Generator Peta HTML OpenStreetMap (Leaflet)
// Generator Peta HTML OpenStreetMap (Leaflet) yang 100% Gratis Tanpa API Key
const generateMapHTML = (lat: number, lon: number) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: transparent; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false
        }).setView([${lat}, ${lon}], 15);

        // Ganti ke OpenStreetMap standar agar tulisan API Key hilang
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        });
        L.marker([${lat}, ${lon}], {icon: icon}).addTo(map);
      </script>
    </body>
  </html>
`;

export default function MonitoringSensorPage() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const router = useRouter();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { getSensorById } = useSensorStore();
  const storeSensor = id ? getSensorById(id) : undefined;

  const [inputSensorId, setInputSensorId] = useState(id ?? "");
  const [refreshedSensor, setRefreshedSensor] =
    useState<Sensor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const refreshLock = useRef(false);

  // Sinkronkan input dengan ID pada URL.
  useEffect(() => {
    setInputSensorId(id ?? "");
    setRefreshedSensor(null);
    setRefreshError("");
  }, [id]);

  // Gunakan data dari server jika tersedia.
  const sensor: Sensor | undefined =
    refreshedSensor ?? storeSensor;

  // Ambil data sensor terbaru dari server berdasarkan ID.
  const handleRefresh = useCallback(async () => {
    if (!id || refreshLock.current) return;

    refreshLock.current = true;
    setIsRefreshing(true);
    setRefreshError("");

    try {
      const list = await fetchInitialSensors();

      const latest = list
        .filter((item) => String(item.id) === String(id))
        .sort((a, b) => b.lastUpdated - a.lastUpdated)[0];

      if (!latest) {
        setRefreshedSensor(null);
        setRefreshError(
          `Sensor dengan ID ${id} tidak ditemukan di server.`
        );
        return;
      }

      setRefreshedSensor(latest);
    } catch (error) {
      console.error("Gagal memuat data sensor:", error);

      setRefreshError(
        "Gagal memuat data terbaru. Periksa koneksi internet."
      );
    } finally {
      refreshLock.current = false;
      setIsRefreshing(false);
    }
  }, [id]);

  // Refresh saat halaman dibuka dan setiap 5 detik.
  useEffect(() => {
    if (!id) return;

    void handleRefresh();

    const interval = setInterval(() => {
      if (AppState.currentState === "active") {
        void handleRefresh();
      }
    }, 5000);

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          void handleRefresh();
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [id, handleRefresh]);

  const hasLocation =
    !!sensor?.location &&
    sensor.location.latitude !== 0 &&
    sensor.location.longitude !== 0;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
      }}
    >
      <ScreenHeader title="Monitoring Sensor" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: scale(40),
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* INPUT ID SENSOR */}
        <View
          style={{
            width: "100%",
            marginTop: scale(16),
            marginBottom: scale(20),
          }}
        >
        </View>

        {/* KONDISI TANAH */}
        {!id ? (
          <View
            style={{
              width: "100%",
              paddingVertical: scale(30),
              alignItems: "center",
            }}
          >
            <Leaf size={scale(36)} color="#105C2E" />

            <Text
              style={{
                color: "#1A202C",
                fontFamily: "PoppinsSemiBold",
                fontSize: scale(15),
                textAlign: "center",
                marginTop: scale(12),
              }}
            >
              Masukkan ID sensor
            </Text>

            <Text
              style={{
                color: "#64748B",
                fontFamily: "PoppinsRegular",
                fontSize: scale(12),
                textAlign: "center",
                marginTop: scale(4),
              }}
            >
              Data sensor akan ditampilkan setelah ID dimasukkan.
            </Text>
          </View>
        ) : !sensor && isRefreshing ? (
          <View
            style={{
              paddingVertical: scale(35),
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#105C2E" />

            <Text
              style={{
                color: "#4A5468",
                fontFamily: "PoppinsMedium",
                fontSize: scale(13),
                marginTop: scale(12),
              }}
            >
              Memuat data sensor...
            </Text>
          </View>
        ) : !sensor ? (
          <View
            style={{
              width: "100%",
              paddingVertical: scale(24),
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#D32F2F",
                fontFamily: "PoppinsMedium",
                fontSize: scale(13),
                textAlign: "center",
              }}
            >
              {refreshError || "Data sensor belum tersedia."}
            </Text>

            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: scale(8),
                marginTop: scale(14),
                paddingVertical: scale(10),
                paddingHorizontal: scale(16),
                borderRadius: scale(12),
                backgroundColor: "#105C2E",
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              <RefreshCcw size={scale(16)} color="#FFFFFF" />

              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "PoppinsSemiBold",
                  fontSize: scale(13),
                }}
              >
                Coba Lagi
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View
              style={{
                width: scale(CARD_WIDTH),
                marginTop: scale(4),
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: scale(8),
                }}
              >
                <Leaf size={scale(28)} color="#232323" />

                <Text
                  style={{
                    color: "#232323",
                    fontFamily: "PoppinsBold",
                    fontSize: scale(21),
                  }}
                >
                  Kondisi Tanah
                </Text>
              </View>

              <Text
                style={{
                  color: "#232323",
                  fontFamily: "PoppinsMedium",
                  fontSize: scale(12),
                  marginTop: scale(2),
                  textAlign: "center",
                }}
              >
                Pembaruan terakhir: {getTimeAgo(sensor.lastUpdated)}
              </Text>

              <Text
                style={{
                  color: "#64748B",
                  fontFamily: "PoppinsRegular",
                  fontSize: scale(11),
                  marginTop: scale(2),
                }}
              >
                ID Sensor: {sensor.id}
              </Text>
            </View>

            {/* DATA SENSOR */}
            <SensorCard
              sensorId={sensor.id}
              sensorData={sensor}
            />

            {/* REFRESH DATA */}
            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: scale(6),
                marginTop: scale(8),
                marginBottom: scale(10),
                paddingVertical: scale(8),
                paddingHorizontal: scale(14),
                borderRadius: scale(14),
                borderWidth: scale(1.5),
                borderColor: "#105C2E",
                backgroundColor: "#FFFFFF",
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              {isRefreshing ? (
                <ActivityIndicator
                  size="small"
                  color="#105C2E"
                />
              ) : (
                <RefreshCcw
                  size={scale(14)}
                  color="#105C2E"
                />
              )}

              <Text
                style={{
                  color: "#105C2E",
                  fontFamily: "PoppinsSemiBold",
                  fontSize: scale(12.5),
                }}
              >
                {isRefreshing ? "Memuat..." : "Refresh Data"}
              </Text>
            </Pressable>

            {refreshError ? (
              <Text
                style={{
                  color: "#D32F2F",
                  fontFamily: "PoppinsMedium",
                  fontSize: scale(11.5),
                  textAlign: "center",
                  marginBottom: scale(12),
                }}
              >
                {refreshError}
              </Text>
            ) : null}

            {/* STATUS SENSOR */}
            <View
              style={{
                width: scale(CARD_WIDTH),
                marginTop: scale(20),
              }}
            >
              <StatusSensorCard
                battery={sensor.status.battery}
                batteryHealth={sensor.status.batteryHealth}
                loraStatus={sensor.status.loraStatus}
                gpsActive={hasLocation}
                lastUpdated={sensor.lastUpdated}
              />
            </View>

            {/* LOKASI SENSOR */}
            <View
              style={{
                marginTop: scale(24),
                marginBottom: scale(20),
                width: scale(CARD_WIDTH),
              }}
            >
              <View
                style={{
                  width: "100%",
                  borderRadius: scale(6),
                  borderWidth: scale(0.5),
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
                    minHeight: scale(47),
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
                    Lokasi Sensor
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
                          {sensor.location!.latitude.toFixed(6)},{" "}
                          {sensor.location!.longitude.toFixed(6)}
                        </Text>

                        <Text
                          style={{
                            color: "#4A5468",
                            fontFamily: "PoppinsMedium",
                            fontStyle: "italic",
                            fontSize: scale(11.5),
                          }}
                        >
                          Diperbarui:{" "}
                          {getTimeAgo(sensor.location!.timestamp)}
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
                      borderTopWidth: scale(0.5),
                      borderTopColor: "#006134",
                      overflow: "hidden",
                      pointerEvents: "none",
                      backgroundColor: "#f0f0f0", // Tambahan background abu-abu saat WebView loading
                    }}
                  >
                    <WebView
                      originWhitelist={['*']}
                      source={{ html: generateMapHTML(sensor.location!.latitude, sensor.location!.longitude) }}
                      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                      scrollEnabled={false}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}