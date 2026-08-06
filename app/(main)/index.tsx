import { COLORS } from "@/constants";
import { useSensorStore } from "@/store/sensorContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
<<<<<<< Updated upstream

=======
import AddLahanCard from "@/components/form/AddlahanCard";
import { ChartNoAxesCombined, CloudMoonRain, ThermometerSun, Droplets } from 'lucide-react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
  const [namaLahan, setNamaLahan] = useState("");

  function handleTambah() {
    console.log("simpan lahan:", namaLahan);
  }

>>>>>>> Stashed changes
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient
        colors={["#1B4C3F", "#2E7D32", "#66BB6A"]}
        start={{ x: 0, y: 0 }}
<<<<<<< Updated upstream
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
=======
        end={{ x: 1.3, y: 0 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 30 }]}
>>>>>>> Stashed changes
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{settings.farmerName}</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/(features)/(setting)")}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

<<<<<<< Updated upstream
      {/* Status Card (Overlay Header) */}
      <View style={[styles.statusCard, { top: insets.top + 110 }]}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Aman</Text>
        </View>
        <Text style={styles.statusDesc}>
          Tidak Ada Aksi Yang Perlu{"\n"}Dilakukan, Aman
        </Text>
      </View>

=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
                  pathname: "/(features)/(sensor)/[id]",
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
=======
        <View style={styles.suhudanlembap}>
          <LinearGradient 
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.suhucard}
          >
            <ThermometerSun size={29} color="#FFF" style={styles.buttonIconLeft}/>
            <View style={{flexDirection:"column", width:"100%", height:"100%", justifyContent:"flex-start", alignItems:"center", paddingTop:5}}>
              <Text style={styles.buttonText}>Suhu</Text>
            </View>
          </LinearGradient>
          <LinearGradient 
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }}
            style={styles.lembapcard}
          >
            <Droplets size={29} color="#FFF" style={styles.buttonIconLeft} />
            <View style={{flexDirection:"column", width:"100%", height:"100%", justifyContent:"flex-start", alignItems:"center", paddingTop:5}}>
              <Text style={styles.buttonText}>Lembap</Text>
            </View>
          </LinearGradient>
        </View>
        <AddLahanCard
          value={namaLahan}
          onChangeText={setNamaLahan}
          onSubmit={handleTambah}
        />
        
        <TouchableOpacity onPress={() => router.push("/(features)/(monitoring)")} activeOpacity={0.8}>
          <LinearGradient 
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }} 
            style={styles.monitoringtanah}
          >
            <ChartNoAxesCombined color="#FFF" size={22} style={styles.buttonIconLeft} />
            <Text style={styles.buttonText}>Monitoring Tanah</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(main)/history.tsx")} activeOpacity={0.8}>
          <LinearGradient 
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.3, y: 0 }} 
            style={styles.monitoringtanah}
          >
            <MaterialIcons name="history" size={29} color="#FFF" style={styles.buttonIconLeft} />
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
            <View style={{flexDirection:"row", width:"100%"}}>
            </View>
            <View style={{flexDirection:"column", width:"100%", alignItems:"flex-end"}}>
              <View style={{width:"100%", alignItems:"center"}}>
                <Text style={styles.buttonTextPrakiraan}>Prakiraan Cuaca</Text>
              </View>
              <View style={{width:"85%", alignItems:"flex-end"}}>
                <Text style={{color:"#FFF", fontSize:12}}>Hujan ringan diperkirakan sore ini pukul 16:00.</Text>
              </View>
            </View>
        </LinearGradient>
        <View style={styles.lokasi}>
                <View style={{flexDirection:"row", alignItems:"center", justifyContent:"center", height:40, gap:5}}>
                    <FontAwesome6 name="map-location-dot" size={24} color="#006134" />
                    <Text style={{fontWeight:"bold", fontSize:20}}>Lokasi Sawah</Text>
                </View>
                <View style={{width:'100%', height:150,borderColor:"#006134",borderTopWidth:0.4,borderRightWidth:0.5,borderLeftWidth:0.5, borderBottomWidth:0.5, borderRadius:15, overflow:"hidden"}}>
                          <MapView
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    paddingHorizontal: 25,
    paddingBottom: 75,
=======
    width: "100%",
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
>>>>>>> Stashed changes
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "white",
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
<<<<<<< Updated upstream
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
=======
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  suhudanlembap: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    height: 70,
>>>>>>> Stashed changes
    zIndex: 999,
  },
  suhucard: {
    flexDirection: "column",
    width: "50%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  lembapcard: {
    width: "50%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
<<<<<<< Updated upstream
  sensorBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
=======
  prakiraancuaca: {
    width: "100%", 
    height: 74, 
    borderRadius: 12, 
    flexDirection: "row",
    justifyContent: "flex-end", 
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  buttonIconLeft: {
    position: "absolute",
    left: 16,
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 18,
  },
  buttonTextPrakiraan: {
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 18,
  },
  lokasi: { 
    width: "100%", 
    backgroundColor: "#FFF", 
    borderRadius: 16,  
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 1,
  },
  lokasiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,gap: 8,marginBottom: 10,
  },
  lokasiHeaderText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#006134"
  },
  mapWrapper: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
>>>>>>> Stashed changes
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