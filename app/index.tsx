import AddLahanCard from "@/components/form/AddlahanCard";
import { COLORS } from "@/constants";
import { useSensorStore } from "@/store/sensorContext";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  ChartNoAxesCombined,
  CloudMoonRain,
  Droplets,
  ThermometerSun,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { settings, sensors, connected } = useSensorStore();

  const [location, setLocation] = useState({
    latitude: -7.28197,
    longitude: 112.795323,
  });

  const [namaLahan, setNamaLahan] = useState("");

  function handleTambah() {
    console.log("simpan lahan:", namaLahan);
  }

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const currentLocation = await Location.getCurrentPositionAsync({
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

  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [forecastText, setForecastText] = useState<string>('Memuat prakiraan cuaca...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const latitude = -6.2088;
        const longitude = 106.8456;

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&hourly=precipitation_probability,weathercode`
        );
        const data = await response.json();

        if (data && data.current) {
          setTemperature(data.current.temperature_2m);
          setHumidity(data.current.relative_humidity_2m);
        }

        if (data && data.hourly) {
          const times: string[] = data.hourly.time;
          const probabilities: number[] = data.hourly.precipitation_probability;
          const weatherCodes: number[] = data.hourly.weathercode;

          const now = new Date();
          let foundForecast = false;

          for (let i = 0; i < times.length; i++) {
            const forecastTime = new Date(times[i]);
            if (forecastTime >= now) {
              const hourString = forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const condition = getWeatherDescription(weatherCodes[i]);
              const rainProb = probabilities[i];

              if (rainProb > 40) {
                setForecastText(`Potensi ${condition.toLowerCase()} diperkirakan pukul ${hourString} (${rainProb}% peluang).`);
              } else {
                setForecastText(`Cuaca ${condition.toLowerCase()} diperkirakan pukul ${hourString}.`);
              }

              foundForecast = true;
              break;
            }
          }

          if (!foundForecast) {
            setForecastText('Prakiraan cuaca stabil untuk beberapa jam ke depan.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        setForecastText('Gagal memuat prakiraan cuaca.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherDescription = (code: number): string => {
    switch (code) {
      case 0:
        return "Cerah";
      case 1:
      case 2:
      case 3:
        return "Berawan";
      case 45:
      case 48:
        return "Berkabut";
      case 51:
      case 53:
      case 55:
        return "Gerimis ringan";
      case 61:
      case 63:
        return "Hujan ringan/sedang";
      case 65:
        return "Hujan deras";
      case 71:
      case 73:
      case 75:
        return "Salju";
      case 95:
      case 96:
      case 99:
        return "Badai petir";
      default:
        return "Kondisi normal";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
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
            <Text style={styles.name}>{settings.farmerName || "Nama Petani"}</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(features)/(setting)")}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.suhudanlembap}>
          {/* Suhu Card */}
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.suhucard}
          >
            <ThermometerSun
              size={29}
              color="#FFF"
              style={styles.buttonIconLeft}
            />
            <View style={styles.contentContainer}>
              <Text style={styles.buttonText}>Suhu</Text>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFF"
                  style={{ marginTop: 5 }}
                />
              ) : (
                <Text style={styles.valueText}>
                  {temperature !== null ? `${temperature}°C` : "--"}
                </Text>
              )}
            </View>
          </LinearGradient>

          {/* Lembap Card */}
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.lembapcard}
          >
            <Droplets size={29} color="#FFF" style={styles.buttonIconLeft} />
            <View style={styles.contentContainer}>
              <Text style={styles.buttonText}>Lembap</Text>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFF"
                  style={{ marginTop: 5 }}
                />
              ) : (
                <Text style={styles.valueText}>
                  {humidity !== null ? `${humidity}%` : "--"}
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>

        <AddLahanCard
          value={namaLahan}
          onChangeText={setNamaLahan}
          onAdd={handleTambah}
        />

        <TouchableOpacity
          onPress={() => router.push("/(features)/(monitoring)")}
          activeOpacity={0.8}
          style={{ width: "100%" }} // <--- Tambahkan ini
        >
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.monitoringtanah}
          >
            <ChartNoAxesCombined
              color="#FFF"
              size={22}
              style={styles.buttonIconLeft}
            />
            <Text style={styles.buttonText}>Monitoring Tanah</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(main)/history")}
          activeOpacity={0.8}
          style={{ width: "100%" }} // <--- Tambahkan ini juga
        >
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.monitoringtanah}
          >
            <MaterialIcons
              name="history"
              size={29}
              color="#FFF"
              style={styles.buttonIconLeft}
            />
            <Text style={styles.buttonText}>History Pemupukan</Text>
          </LinearGradient>
        </TouchableOpacity>

        <LinearGradient
          colors={["#105C2E", "#8C6A09"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.3, y: 0 }}
          style={styles.prakiraancuaca}
        >
          <CloudMoonRain size={29} color="#FFF" style={styles.buttonIconLeft} />
          <View
            style={{
              flexDirection: "column",
              width: "100%",
              alignItems: "flex-end",
            }}
          >
            <View style={{ width: "100%", alignItems: "center" }}>
              <Text style={styles.buttonTextPrakiraan}>Prakiraan Cuaca</Text>
            </View>
            <View
              style={{ width: "85%", alignItems: "flex-end", marginTop: 4 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text
                  style={{ color: "#FFF", fontSize: 12, textAlign: "right" }}
                >
                  {forecastText}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.lokasi}>
          <View style={styles.lokasiHeader}>
            <FontAwesome6 name="map-location-dot" size={24} color="#006134" />
            <Text style={styles.lokasiHeaderText}>Lokasi Sawah</Text>
          </View>
          <View style={styles.mapWrapper}>
            {/* MATIKAN SEMENTARA MAP-NYA UNTUK TESTING */}
            {/* <MapView
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
            </MapView> */}
          </View>

          <View style={styles.coordinateCard}>
            <Text style={styles.coordinateText}>
              Latitude : {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinateText}>
              Longitude : {location.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: {
    width: "100%",
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "white", fontSize: 16 },
  name: { color: "#fff", fontWeight: "800", fontSize: 25 },

  // 1. Ubah padding container menjadi 0 karena sebelumnya bentrok dengan scrollContent
  container: { flex: 1, paddingHorizontal: 0, marginTop: 0 },

  // 2. Gunakan margin/padding 20 di sini agar lebarnya proporsional sekitar ~354 mengimbangi AddLahanCard
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 40,
    gap: 16,
    alignItems: 'center', // Pastikan semua elemen rata tengah
  },

  // 3. Tambahkan width 100% agar otomatis mengisi ruang dari margin yang baru 
  suhudanlembap: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    height: 70,
    width: "100%",
  },

  // 4. Ubah lebar card setengah dari 50% menjadi flex: 1 agar tidak overflow (meluber) saat ditambah gap
  suhucard: {
    flexDirection: "column",
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  lembapcard: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  monitoringtanah: {
    width: "100%",
    height: 60,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  prakiraancuaca: {
    width: "100%",
    height: 74,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 30,
    position: "relative",
  },
  buttonIconLeft: { position: "absolute", left: 16 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  buttonTextPrakiraan: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  lokasi: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  lokasiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    gap: 8,
    marginBottom: 10,
  },
  lokasiHeaderText: { fontWeight: "bold", fontSize: 18, color: "#006134" },
  mapWrapper: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
  },
  map: { width: "100%", height: "100%" },
  coordinateCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    elevation: 1,
  },
  coordinateText: { fontSize: 14, color: "#333", lineHeight: 20 },
  contentContainer: {
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 5,
  },
  valueText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
});