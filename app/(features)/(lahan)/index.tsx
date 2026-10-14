// app/(features)/(lahan)/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, Image, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Sprout,
  Ruler,
  Target,
  CalendarClock,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SectionLabel from "../../../components/form/SectionLabel";
import { scale } from "../../../utils/scale";
import { getCurrentLocation, reverseGeocode } from "../../../utils/gps";
import { useLahanStore } from "../../../store/lahanStore";
import { VARIETAS_PADI, VARIETAS_JAGUNG, VarietasPupuk } from "../../../constants/pupukData";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

type Tanaman = "JAGUNG" | "PADI";

const VARIETAS_LABEL: Record<VarietasPupuk, string> = {
  TUNGGAL: "Tunggal (Urea, Sp36, KcL)",
  MAJEMUK_15_15_15: "Majemuk Phonska (15:15:15)",
  MAJEMUK_15_10_12: "Majemuk Phonska (15:10:12)",
};

function formatTanggalInput(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function LahanBaruPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const namaLahan = params.namaLahan ? String(params.namaLahan) : "Lahan Baru";

  const [tanaman, setTanaman] = useState<Tanaman | null>(null);
  const [tanggalTanam, setTanggalTanam] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [luasLahan, setLuasLahan] = useState("");
  const [targetPanen, setTargetPanen] = useState("");

  const [pupuk, setPupuk] = useState<VarietasPupuk | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pupukOptions = tanaman === "JAGUNG" ? VARIETAS_JAGUNG : VARIETAS_PADI;

  // Lokasi diambil dari GPS di latar belakang dan bersifat opsional (tidak menghalangi penyimpanan)
  const [lokasi, setLokasi] = useState<{ lat: number; lon: number; alamat: string } | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const addLahan = useLahanStore((state) => state.addLahan);

  useEffect(() => {
    let aktif = true;

    (async () => {
      const location = await getCurrentLocation();
      if (!location || !aktif) return;

      const alamat = await reverseGeocode(location.latitude, location.longitude);
      if (aktif) {
        setLokasi({ lat: location.latitude, lon: location.longitude, alamat });
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  // Reset pupuk saat tanaman diganti agar tidak ada pilihan yang tidak valid
  // (Majemuk 15:10:12 hanya tersedia untuk Padi)
  function handlePilihTanaman(t: Tanaman) {
    setTanaman(t);
    setPupuk(null);
  }

  function handleSimpan() {
    if (!tanaman) {
      setErrorMessage("Pilih tanaman terlebih dahulu (Jagung atau Padi)");
      return;
    }
    if (!tanggalTanam) {
      setErrorMessage("Tanggal tanam wajib diisi");
      return;
    }
    if (!luasLahan.trim()) {
      setErrorMessage("Luas lahan wajib diisi");
      return;
    }
    if (!targetPanen.trim()) {
      setErrorMessage("Target hasil panen wajib diisi");
      return;
    }
    if (!pupuk) {
      setErrorMessage("Pilih pupuk terlebih dahulu");
      return;
    }

    setErrorMessage("");

    const idLahan = addLahan({
      namaLahan,
      tanaman,
      tanggalTanam: tanggalTanam.toISOString(),
      pupuk: VARIETAS_LABEL[pupuk],
      luasLahan: Number(luasLahan),
      targetPanen: Number(targetPanen),
      lokasi: {
        alamat: lokasi?.alamat ?? "",
        lat: lokasi?.lat,
        lon: lokasi?.lon,
      },
    });

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
          <Text style={{ color: "#FFFFFF", textAlign: "center", fontFamily: "PoppinsBold", fontSize: scale(18) }}>
            {namaLahan}
          </Text>
        </View>

        {/* Pilih Tanaman */}
        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(20) }}>
          <SectionLabel icon={Sprout} label="Pilih Tanaman" />
          <View style={{ flexDirection: "row", gap: scale(16), marginTop: scale(12) }}>
            <TanamanCard
              label="Jagung"
              image={jagungIcon}
              selected={tanaman === "JAGUNG"}
              onPress={() => handlePilihTanaman("JAGUNG")}
              imageWidth={56}
              imageHeight={73}
            />
            <TanamanCard
              label="Padi"
              image={padiIcon}
              selected={tanaman === "PADI"}
              onPress={() => handlePilihTanaman("PADI")}
              imageWidth={74}
              imageHeight={75}
            />
          </View>
        </View>

        {/* Tanggal Tanam */}
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
            <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16) }}>
              {tanggalTanam ? formatTanggalInput(tanggalTanam) : "dd/mm/yyyy"}
            </Text>
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

        {/* Luas Lahan */}
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

        {/* Target Hasil Panen */}
        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(20) }}>
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

        {/* Pilih Pupuk */}
        <View style={{ width: scale(336), alignItems: "flex-start", alignSelf: "center", marginBottom: scale(20), zIndex: 10 }}>
          <SectionLabel icon={Tag} label="Pilih Pupuk" />

          <Pressable
            onPress={() => {
              if (!tanaman) {
                setErrorMessage("Pilih tanaman terlebih dahulu sebelum memilih pupuk");
                return;
              }
              setDropdownOpen((prev) => !prev);
            }}
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
            <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsMedium", fontSize: scale(16) }}>
              {pupuk ? VARIETAS_LABEL[pupuk] : "Klik Untuk Memilih"}
            </Text>
            {dropdownOpen ? (
              <ChevronUp size={scale(20)} color="#1E1E1E" />
            ) : (
              <ChevronDown size={scale(20)} color="#1E1E1E" />
            )}
          </Pressable>

          {dropdownOpen && tanaman && (
            <View
              style={{
                width: "100%",
                backgroundColor: "#FFFFFF",
                borderRadius: scale(8.49),
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: scale(4),
                elevation: 3,
                marginTop: scale(6),
                overflow: "hidden",
              }}
            >
              {pupukOptions.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    setPupuk(opt);
                    setDropdownOpen(false);
                  }}
                  style={{
                    paddingVertical: scale(14),
                    paddingHorizontal: scale(14),
                    backgroundColor: pupuk === opt ? "#E9FBE0" : "#FFFFFF",
                  }}
                >
                  <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(15), color: "#1E1E1E" }}>
                    {VARIETAS_LABEL[opt]}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
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
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: scale(302.554), height: scale(48), borderRadius: scale(16), justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", textAlign: "center", fontFamily: "PoppinsBold", fontSize: scale(20) }}>
              Simpan Informasi Lahan
            </Text>
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
        <Image
          source={image}
          style={{ width: scale(imageWidth), height: scale(imageHeight), resizeMode: "contain", alignSelf: "center" }}
        />
        <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18.94), color: "#000000", marginTop: scale(4) }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}