// app/(features)/(lahan)/index.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, Pressable, Image, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Sprout, Ruler, Target, CalendarClock, Map, MapPin } from "lucide-react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SectionLabel from "../../../components/form/SectionLabel";
import { scale } from "../../../utils/scale";
import { getCurrentLocation, reverseGeocode } from "../../../utils/gps";
import { useLahanStore } from "../../../store/lahanStore";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

type Tanaman = "JAGUNG" | "PADI";

function formatTanggalInput(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTanggalPanjang(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LahanBaruPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // FIX BUG NAMA LAHAN STUCK: Langsung baca dari params, buang useState-nya!
  const namaLahan = params.namaLahan ? String(params.namaLahan) : "Lahan Baru";

  const [tanaman, setTanaman] = useState<Tanaman | null>(null);
  const [tanggalTanam, setTanggalTanam] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [luasLahan, setLuasLahan] = useState("");
  const [targetPanen, setTargetPanen] = useState("");

  const [lokasi, setLokasi] = useState<{ lat: number; lon: number; alamat: string } | null>(null);
  const [alamatText, setAlamatText] = useState("Mencari lokasi...");
  const [koordinatText, setKoordinatText] = useState("");

  const [isManualLocation, setIsManualLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ZUSTAND STORE
  const addLahan = useLahanStore((state) => state.addLahan);
  const tempAlamat = useLahanStore((state) => state.tempAlamat);
  const setTempAlamat = useLahanStore((state) => state.setTempAlamat);

  // 1. Menarik Lokasi Awal (GPS)
  useEffect(() => {
    (async () => {
      // JIKA USER SUDAH INPUT MANUAL, JANGAN TIMPA PAKAI GPS!
      if (tempAlamat) return;

      const location = await getCurrentLocation();
      if (!location) {
        setAlamatText("Izin lokasi ditolak / gagal mendapat lokasi");
        return;
      }
      setKoordinatText(`Koordinat: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`);
      const alamat = await reverseGeocode(location.latitude, location.longitude);
      setAlamatText(alamat);
      setLokasi({ lat: location.latitude, lon: location.longitude, alamat });
      setIsManualLocation(false);
    })();
  }, [tempAlamat]);

  // 2. Mendengarkan Perubahan dari Halaman LokasiPage (Input Manual via Zustand)
  useEffect(() => {
    if (tempAlamat) {
      setIsManualLocation(true);
      setAlamatText(tempAlamat);
      setKoordinatText("");
      setLokasi({ lat: 0, lon: 0, alamat: tempAlamat });
    }
  }, [tempAlamat]);

  async function handleSimpan() {
    console.log("TEST: mencoba navigasi langsung");
    router.replace("/(features)/(monitoring)" as any);
    if (!tanaman) {
      console.log("GAGAL: tanaman kosong");
      setErrorMessage("Pilih tanaman terlebih dahulu (Jagung atau Padi)");
      return;
    }
    if (!tanggalTanam) {
      console.log("GAGAL: tanggal kosong");
      setErrorMessage("Tanggal tanam wajib diisi");
      return;
    }
    if (!luasLahan.trim()) {
      console.log("GAGAL: luas lahan kosong");
      setErrorMessage("Luas lahan wajib diisi");
      return;
    }
    if (!targetPanen.trim()) {
      console.log("GAGAL: target panen kosong");
      setErrorMessage("Target hasil panen wajib diisi");
      return;
    }
    if (!lokasi?.alamat) {
      console.log("GAGAL: lokasi belum ada", lokasi);
      setErrorMessage("Lokasi sawah belum terdeteksi, mohon tunggu atau atur manual");
      return;
    }

    console.log("SEMUA VALID, lanjut simpan & navigasi...");
    setErrorMessage("");
    // ...sisa kode tidak berubah
    // Simpan data ke Zustand (History Page)
    addLahan({
      namaLahan,
      tanaman: tanaman,
      tanggalTanam: tanggalTanam.toISOString(),
      luasLahan: Number(luasLahan),
      targetPanen: Number(targetPanen),
      lokasi: {
        alamat: lokasi.alamat,
        lat: lokasi.lat,
        lon: lokasi.lon,
      },
    });
    const idLahan = addLahan({
      namaLahan,
      tanaman: tanaman!,
      tanggalTanam: tanggalTanam!.toISOString(),
      luasLahan: Number(luasLahan),
      targetPanen: Number(targetPanen),
      lokasi: {
        alamat: lokasi!.alamat,
        lat: lokasi!.lat,
        lon: lokasi!.lon,
      },
    });
    // PENTING: Bersihkan temp alamat manual agar GPS jalan lagi saat buat lahan baru!
    setTempAlamat("");

    // Lanjut ke Monitoring dengan membawa parameter
    router.replace({
      pathname: "/(features)/(monitoring)",
      params: { idLahan },
    } as any);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title="Lahan Baru" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: scale(40),
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: scale(202),
            height: scale(31),
            borderRadius: scale(10.537),
            backgroundColor: "#2C8A40",
            justifyContent: "center",
            alignItems: "center",
            marginTop: scale(16),
            marginBottom: scale(24),
          }}
        >
          <Text style={{ color: "#FFFFFF", textAlign: "center", fontFamily: "PoppinsBold", fontSize: scale(18) }}>{namaLahan}</Text>
        </View>

        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(20) }}>
          <SectionLabel icon={Sprout} label="Pilih Tanaman" />
          <View style={{ flexDirection: "row", gap: scale(16), marginTop: scale(12) }}>
            <TanamanCard label="Jagung" image={jagungIcon} selected={tanaman === "JAGUNG"} onPress={() => setTanaman("JAGUNG")} imageWidth={56} imageHeight={73} />
            <TanamanCard label="Padi" image={padiIcon} selected={tanaman === "PADI"} onPress={() => setTanaman("PADI")} imageWidth={74} imageHeight={75} />
          </View>
        </View>

        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(20) }}>
          <SectionLabel icon={CalendarClock} label="Tanggal Tanam" />
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={{
              width: "100%",
              height: scale(53.89),
              borderRadius: scale(8.49),
              backgroundColor: "#FFFFFF",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: scale(4),
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: scale(14),
              marginTop: scale(12),
            }}
          >
            <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16) }}>{tanggalTanam ? formatTanggalInput(tanggalTanam) : "dd/mm/yyyy"}</Text>
            <CalendarClock size={scale(22)} color="#1E1E1E" />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={tanggalTanam ?? new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setTanggalTanam(selectedDate);
              }}
            />
          )}
        </View>

        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(20) }}>
          <SectionLabel icon={Ruler} label="Luas Lahan" />
          <View
            style={{
              width: "100%",
              height: scale(53.887),
              borderRadius: scale(8.49),
              backgroundColor: "#FFFFFF",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: scale(4),
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: scale(14),
              marginTop: scale(12),
            }}
          >
            <TextInput
              value={luasLahan}
              onChangeText={setLuasLahan}
              placeholder="Masukkan luas lahan..."
              placeholderTextColor="#1E1E1E"
              keyboardType="numeric"
              style={{ flex: 1, color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16), includeFontPadding: false }}
            />
            <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16) }}>Hektar</Text>
          </View>
        </View>

        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(24) }}>
          <SectionLabel icon={Target} label="Target Hasil Panen" />
          <View
            style={{
              width: "100%",
              height: scale(53.887),
              borderRadius: scale(8.49),
              backgroundColor: "#FFFFFF",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: scale(4),
              elevation: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: scale(14),
              marginTop: scale(12),
            }}
          >
            <TextInput
              value={targetPanen}
              onChangeText={setTargetPanen}
              placeholder="Masukkan target..."
              placeholderTextColor="#1E1E1E"
              keyboardType="numeric"
              style={{ flex: 1, color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16), includeFontPadding: false }}
            />
            <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16) }}>Ton/Hektar</Text>
          </View>
        </View>

        <View style={{ marginBottom: scale(30) }}>
          <LokasiSawahCard alamat={alamatText} koordinat={koordinatText} lat={lokasi?.lat} lon={lokasi?.lon} isManualLocation={isManualLocation} onSesuaikanLokasi={() => router.push("/(features)/(lokasi)" as any)} />
        </View>

        {errorMessage ? (
          <Text
            style={{
              color: "#D32F2F",
              fontFamily: "PoppinsMedium",
              fontSize: scale(13),
              textAlign: "center",
              marginBottom: scale(12),
              width: scale(300),
            }}
          >
            {errorMessage}
          </Text>
        ) : null}

        <Pressable onPress={handleSimpan} style={{ marginBottom: scale(30) }}>
          <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: scale(302.554), height: scale(48), borderRadius: scale(16), justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", textAlign: "center", fontFamily: "PoppinsBold", fontSize: scale(20) }}>Simpan Informasi Lahan</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// LOCAL COMPONENTS
// ==========================================

interface TanamanCardProps {
  label: string;
  image: any;
  selected: boolean;
  onPress: () => void;
  imageWidth?: number;
  imageHeight?: number;
}

function TanamanCard({ label, image, selected, onPress, imageWidth = 70, imageHeight = 80 }: TanamanCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          width: scale(160),
          height: scale(130),
          borderRadius: scale(10),
          backgroundColor: selected ? "#E9FBE0" : "#F7F9FC",
          borderWidth: selected ? scale(2) : 0,
          borderColor: "#58C15C",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: scale(4),
          elevation: 3,
        }}
      >
        <Image source={image} style={{ width: scale(imageWidth), height: scale(imageHeight), resizeMode: "contain", alignSelf: "center" }} />
        <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18.94), color: "#000000", marginTop: scale(4) }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

interface LokasiSawahCardProps {
  alamat: string;
  koordinat: string;
  lat?: number;
  lon?: number;
  isManualLocation: boolean;
  onSesuaikanLokasi: () => void;
}

function LokasiSawahCard({ alamat, koordinat, lat, lon, isManualLocation, onSesuaikanLokasi }: LokasiSawahCardProps) {
  return (
    <View style={{ width: scale(336), borderRadius: scale(6.05), borderWidth: scale(0.403), borderColor: "#006134", backgroundColor: "#FFFFFF", alignSelf: "center", overflow: "hidden" }}>
      <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: "100%", height: scale(47), flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(8) }}>
        <Map size={scale(20)} color="#FFFFFF" />
        <Text style={{ color: "#FFFFFF", textAlign: "center", fontFamily: "PoppinsBold", fontSize: scale(18) }}>Lokasi Sawah</Text>
      </LinearGradient>

      <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), paddingHorizontal: scale(12), paddingVertical: scale(10) }}>
        <MapPin size={scale(27)} color="#006134" />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontStyle: "italic", fontSize: scale(13) }}>
            {alamat}
          </Text>
          {koordinat ? <Text style={{ color: "#4A5468", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(10), marginTop: scale(2) }}>{koordinat}</Text> : null}
        </View>
      </View>

      {!isManualLocation && (
        <View style={{ width: scale(336), height: scale(156), borderTopWidth: scale(0.403), borderTopColor: "#006134", overflow: "hidden", pointerEvents: "none" }}>
          {lat && lon ? (
            <MapView
              style={{ width: "100%", height: "100%" }}
              mapType="none"
              region={{ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <UrlTile urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" maximumZ={19} />
              <Marker coordinate={{ latitude: lat, longitude: lon }} />
            </MapView>
          ) : (
            <View style={{ flex: 1, backgroundColor: "#D9D9D9", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: "PoppinsRegular", color: "#666666" }}>Memuat peta...</Text>
            </View>
          )}
        </View>
      )}

      <Pressable onPress={onSesuaikanLokasi} style={{ width: "100%", height: scale(28.517), backgroundColor: "#2C8A40", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FFFFFF", textAlign: "center", fontFamily: "PoppinsSemiBold", fontSize: scale(15) }}>Sesuaikan Lokasi</Text>
      </Pressable>
    </View>
  );
}
