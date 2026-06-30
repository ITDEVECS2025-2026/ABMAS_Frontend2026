import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { COLORS } from "@/constants";
import { useSensorStore } from "@/store/sensorContext";
import * as Location from "expo-location";


export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { settings, sensors, connected } = useSensorStore();

  const [location, setLocation] = useState({
    latitude: -7.281970,
    longitude: 112.795323,
  });

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

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
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={["#1B4C3F", "#2E7D32", "#66BB6A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{settings.farmerName}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/(soil)/(setting)")}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Status Card (Overlay Header) */}
      <View style={[styles.statusCard, { top: insets.top + 110 }]}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Aman</Text>
        </View>
        <Text style={styles.statusDesc}>
          Tidak Ada Aksi Yang Perlu{"\n"}Dilakukan, Aman
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: 60,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* List Sensor */}
        <Text style={styles.sectionTitle}>List Sensor</Text>
        {sensors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {connected ? "Memuat data sensor..." : "Menghubungkan ke server..."}
            </Text>
          </View>
        ) : (
          sensors.map((sensor) => (
            <TouchableOpacity
              key={sensor.id}
              style={styles.sensorBtn}
              onPress={() =>
                router.push({
                  pathname: "/(soil)/(sensor)/[id]",
                  params: { id: sensor.id },
                })
              }
            >
              <Text style={styles.sensorBtnText}>{sensor.name}</Text>
            </TouchableOpacity>
          ))
        )}

        {/* Lokasi Sawah */}
        <Text style={styles.sectionTitle}>Lokasi Sawah</Text>
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Lokasi Anda"
          />
        </MapView>

        <View style={styles.coordinateCard}>
          <Text style={styles.coordinateText}>
            Latitude : {location.latitude.toFixed(6)}
          </Text>

          <Text style={styles.coordinateText}>
            Longitude : {location.longitude.toFixed(6)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingHorizontal: 25,
    paddingBottom: 75,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
  },
  name: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 25,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 0,
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  statusCard: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 999,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
    fontSize: 13,
  },
  statusDesc: {
    color: "#333",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
    marginTop: 14,
  },
  sensorBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sensorBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  map: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  coordinateCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    elevation: 1,
  },
  coordinateText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },

  emptyText: { color: "#888", fontSize: 13 },

});