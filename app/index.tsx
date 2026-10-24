// app/index.tsx
import AddLahanCard from "@/components/form/AddlahanCard";
import { COLORS } from "@/constants";
import {
  useDeviceLocation,
  type DeviceCoords,
  type LocationStatus,
} from "@/lib/hooks/useDeviceLocation";
import { useWeather } from "@/lib/hooks/useWeather";
import { useSettingsStore } from "@/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChartNoAxesCombined,
  CloudMoonRain,
  Droplets,
  ThermometerSun,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Generator Peta HTML OpenStreetMap (Leaflet)
const generateMapHTML = (lat: number, lon: number) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Inisialisasi peta dimatikan interaksinya agar tidak bentrok dengan scroll HP
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false
        }).setView([${lat}, ${lon}], 15);

        // Memuat CartoDB Voyager (Gratis & Clean)
        L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Pin Lokasi (Marker bawaan)
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

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const farmerName = useSettingsStore((state) => state.farmerName);

  const { coords, status, retry } = useDeviceLocation();
  const weather = useWeather(coords?.latitude, coords?.longitude);

  const [namaLahan, setNamaLahan] = useState("");

  function handleTambah() {
    console.log("simpan lahan:", namaLahan);
  }

  const locationUnavailable = !coords && status !== "loading";
  const weatherLoading = !locationUnavailable && weather.loading;
  const temperature = locationUnavailable ? null : weather.temperature;
  const humidity = locationUnavailable ? null : weather.humidity;
  const forecastText = locationUnavailable
    ? "Aktifkan lokasi untuk melihat prakiraan cuaca."
    : weather.forecastText;

  const getGreeting = () => {
    const hour = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hour12: false,
    });

    const h = Number(hour);
    if (h >= 4 && h < 11) return "Selamat Pagi,";
    if (h >= 11 && h < 15) return "Selamat Siang,";
    if (h >= 15 && h < 18) return "Selamat Sore,";
    return "Selamat Malam,";
  };

  return (
    <View style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={["#1B4C3F", "#2E7D32", "#66BB6A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.3, y: 0 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 30 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{farmerName || "Nama Petani"}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(features)/(setting)")}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.suhudanlembap}>
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.suhucard}
          >
            <ThermometerSun size={29} color="#FFF" style={styles.buttonIconLeft} />
            <View style={styles.contentContainer}>
              <Text style={styles.buttonText}>Suhu</Text>
              {weatherLoading ? (
                <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 5 }} />
              ) : (
                <Text style={styles.valueText}>
                  {temperature !== null ? `${temperature}°C` : "--"}
                </Text>
              )}
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.lembapcard}
          >
            <Droplets size={29} color="#FFF" style={styles.buttonIconLeft} />
            <View style={styles.contentContainer}>
              <Text style={styles.buttonText}>Lembap</Text>
              {weatherLoading ? (
                <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 5 }} />
              ) : (
                <Text style={styles.valueText}>
                  {humidity !== null ? `${humidity}%` : "--"}
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>

        <AddLahanCard value={namaLahan} onChangeText={setNamaLahan} onAdd={handleTambah} />

        <TouchableOpacity onPress={() => router.push("/(features)/(monitoring)")} activeOpacity={0.8} style={{ width: "100%" }}>
          <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1.3, y: 0 }} style={styles.monitoringtanah}>
            <ChartNoAxesCombined color="#FFF" size={22} style={styles.buttonIconLeft} />
            <Text style={styles.buttonText}>Monitoring Tanah</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(main)/history")} activeOpacity={0.8} style={{ width: "100%" }}>
          <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1.3, y: 0 }} style={styles.monitoringtanah}>
            <MaterialIcons name="history" size={29} color="#FFF" style={styles.buttonIconLeft} />
            <Text style={styles.buttonText}>History Pemupukan</Text>
          </LinearGradient>
        </TouchableOpacity>

        <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1.3, y: 0 }} style={styles.prakiraancuaca}>
          <CloudMoonRain size={29} color="#FFF" style={styles.buttonIconLeft} />
          <View style={{ flexDirection: "column", width: "100%", alignItems: "flex-end" }}>
            <View style={{ width: "100%", alignItems: "center" }}>
              <Text style={styles.buttonTextPrakiraan}>Prakiraan Cuaca</Text>
            </View>
            <View style={{ width: "85%", alignItems: "flex-end", marginTop: 4 }}>
              {weatherLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{ color: "#FFF", fontSize: 12, textAlign: "right" }}>
                  {forecastText}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        <LokasiSawahCard coords={coords} status={status} onRetry={retry} />
      </ScrollView>
    </View>
  );
}

interface LokasiSawahCardProps {
  coords: DeviceCoords | null;
  status: LocationStatus;
  onRetry: () => void;
}

function getStatusMessage(status: LocationStatus): string {
  switch (status) {
    case "loading":
      return "Mencari lokasi perangkat...";
    case "denied":
      return "Izin lokasi ditolak. Aktifkan izin lokasi agar peta dan cuaca sesuai posisi Anda.";
    case "services-off":
      return "GPS perangkat nonaktif. Aktifkan GPS lalu tekan Coba Lagi.";
    default:
      return "Gagal mendapatkan lokasi. Silakan coba lagi.";
  }
}

function LokasiSawahCard({ coords, status, onRetry }: LokasiSawahCardProps) {
  return (
    <View style={styles.lokasi}>
      <View style={styles.lokasiHeader}>
        <FontAwesome6 name="map-location-dot" size={24} color="#006134" />
        <Text style={styles.lokasiHeaderText}>Lokasi Sawah</Text>
      </View>

      {coords ? (
        <>
          <View style={styles.mapWrapper} pointerEvents="none">
            <WebView
              originWhitelist={['*']}
              source={{ html: generateMapHTML(coords.latitude, coords.longitude) }}
              style={styles.map}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.coordinateCard}>
            <Text style={styles.coordinateText}>Latitude : {coords.latitude.toFixed(6)}</Text>
            <Text style={styles.coordinateText}>Longitude : {coords.longitude.toFixed(6)}</Text>
            {coords.accuracy !== null && (
              <Text style={styles.coordinateText}>
                Akurasi : ±{Math.round(coords.accuracy)} m
              </Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.statusBox}>
          {status === "loading" ? <ActivityIndicator size="small" color="#006134" /> : null}
          <Text style={styles.statusText}>{getStatusMessage(status)}</Text>

          {status !== "loading" && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.smallButton} onPress={onRetry} activeOpacity={0.8}>
                <Text style={styles.smallButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
              {status === "denied" && (
                <TouchableOpacity style={styles.smallButton} onPress={() => Linking.openSettings()} activeOpacity={0.8}>
                  <Text style={styles.smallButtonText}>Buka Pengaturan</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { width: "100%", paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: "white", fontSize: 16 },
  name: { color: "#fff", fontWeight: "800", fontSize: 25 },
  container: { flex: 1, paddingHorizontal: 0, marginTop: 0 },
  scrollContent: { paddingTop: 20, paddingHorizontal: 30, gap: 16, alignItems: "center" },
  suhudanlembap: { backgroundColor: "#FFF", borderRadius: 12, flexDirection: "row", justifyContent: "center", gap: 5, height: 70, width: "100%" },
  suhucard: { flexDirection: "column", flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  lembapcard: { flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  monitoringtanah: { width: "100%", height: 60, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  prakiraancuaca: { width: "100%", height: 74, borderRadius: 12, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", paddingHorizontal: 30, position: "relative" },
  buttonIconLeft: { position: "absolute", left: 16 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  buttonTextPrakiraan: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  lokasi: { width: "100%", backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", padding: 12 },
  lokasiHeader: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 40, gap: 8, marginBottom: 10 },
  lokasiHeaderText: { fontWeight: "bold", fontSize: 18, color: "#006134" },
  mapWrapper: { width: "100%", height: 120, borderRadius: 14, overflow: "hidden", backgroundColor: "#f0f0f0" },
  map: { width: "100%", height: "100%", backgroundColor: "transparent" },
  coordinateCard: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 10, elevation: 1 },
  coordinateText: { fontSize: 14, color: "#333", lineHeight: 20 },
  statusBox: { alignItems: "center", paddingVertical: 14, gap: 10 },
  statusText: { fontSize: 13, color: "#4A5468", textAlign: "center", lineHeight: 19 },
  buttonRow: { flexDirection: "row", gap: 10 },
  smallButton: { backgroundColor: "#105C2E", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  smallButtonText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  contentContainer: { flexDirection: "column", width: "100%", height: "100%", justifyContent: "flex-start", alignItems: "center", paddingTop: 5 },
  valueText: { color: "#FFF", fontSize: 18, fontWeight: "bold", marginTop: 4 },
});