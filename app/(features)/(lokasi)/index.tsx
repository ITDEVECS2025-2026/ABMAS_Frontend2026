// app/(features)/(lokasi)/index.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import { scale } from "../../../utils/scale";

export default function LokasiPage() {
  const router = useRouter();

  // State form lokasi murni manual
  const [provinsi, setProvinsi] = useState("");
  const [kota, setKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [alamat, setAlamat] = useState("");

  function handleSimpan() {
    // Validasi kosong
    if (!provinsi.trim() || !kota.trim() || !kecamatan.trim() || !alamat.trim()) {
      Alert.alert("Gagal Menyimpan", "Semua kolom wajib diisi!");
      return;
    }

    // Gabungkan menjadi satu string
    const alamatLengkap = `${alamat}, ${kecamatan}, ${kota}, ${provinsi}`;

    // Kirim data kembali ke halaman lahan menggunakan parameter
    router.navigate({
      pathname: "/(features)/(lahan)",
      params: {
        updatedAlamat: alamatLengkap,
        // Kita kirim string kosong untuk koordinat karena fitur map dihapus
        updatedLat: "", 
        updatedLon: "",
      },
    } as any);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title="Lokasi" />

      <ScrollView 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 15, paddingTop: scale(20), paddingBottom: scale(40), alignItems: "center" }}
      >
        
        <InputField label="Alamat" value={alamat} onChangeText={setAlamat} placeholder="Contoh: Jl. Raya ITS" />
        <InputField label="Kecamatan" value={kecamatan} onChangeText={setKecamatan} placeholder="Masukkan Kecamatan" />
        <InputField label="Kota/Kabupaten" value={kota} onChangeText={setKota} placeholder="Masukkan Kota/Kabupaten" />
        <InputField label="Provinsi" value={provinsi} onChangeText={setProvinsi} placeholder="Masukkan Provinsi" />

        {/* Simpan Button */}
        <Pressable onPress={handleSimpan} style={{ marginTop: scale(20) }}>
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: scale(302.554), height: scale(48), borderRadius: scale(16), justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(20) }}>Simpan</Text>
          </LinearGradient>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================
// LOCAL COMPONENTS
// ==========================================

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

function InputField({ label, value, onChangeText, placeholder }: InputFieldProps) {
  return (
    <View style={{ width: scale(336), alignSelf: "center", marginBottom: scale(20) }}>
      <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#1E1E1E", marginBottom: scale(8), includeFontPadding: false }}>
        {label}
      </Text>
      <View style={{
        width: "100%", height: scale(53.887), borderRadius: scale(8.49), backgroundColor: "#FFFFFF",
        shadowColor: "#000000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: scale(4),
        elevation: 3, justifyContent: "center", paddingHorizontal: scale(14)
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0AEC0"
          style={{ flex: 1, color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16), includeFontPadding: false }}
        />
      </View>
    </View>
  );
}