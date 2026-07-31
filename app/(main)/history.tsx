import React, { useState } from "react";
import { SafeAreaView, View, TextInput, StyleSheet, Text, StatusBar, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLahanStore } from "../../store/lahanStore";
import { useRouter } from "expo-router";

// ✅ IMPORT KOMPONEN BUATAN KATINGMU
import AddLahanCard from "../../components/form/AddlahanCard";

// Fungsi penerjemah tanggal
const formatTanggal = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
};

export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk nama lahan baru
  const [newLahanInput, setNewLahanInput] = useState("");

  const { lahanList } = useLahanStore();

  // Fungsi Klik Kartu: Pindah ke Monitoring & bawa ID lahan
  const handleCardPress = (id: string) => {
    router.push({
      pathname: "/(features)/(monitoring)",
      params: { idLahan: id },
    });
  };

  // Filter daftar lahan berdasarkan search bar
  const filteredLahan = lahanList.filter((item) => item.namaLahan.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER GRADASI */}
      <LinearGradient colors={["#1b5e20", "#4d6b13", "#767614"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History Pemupukan</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput style={[styles.searchInput, searchQuery.length === 0 ? styles.italicText : styles.normalText]} placeholder="Cari Nama Lahan.." placeholderTextColor="#64748B" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* LIST KARTU LAHAN */}
        <View style={styles.listContainer}>
          {filteredLahan.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.7} onPress={() => handleCardPress(item.id)}>
              <View style={styles.iconContainer}>
                <Image source={item.tanaman === "JAGUNG" ? require("../../styles/assets/jagung icon.png") : require("../../styles/assets/padi icon.png")} style={styles.iconImage} />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.lahanName}>{item.namaLahan}</Text>
                <LinearGradient colors={["#166534", "#4d6b13", "#767614"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.cropBadge}>
                  <Text style={styles.cropText}>{item.tanaman === "JAGUNG" ? "Tanaman Jagung" : "Tanaman Padi"}</Text>
                </LinearGradient>
              </View>

              <Text style={styles.dateText}>{formatTanggal(item.tanggalTanam)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 👇 INI DIA KOMPONEN DARI KATINGMU 👇 */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <AddLahanCard
            value={newLahanInput}
            onChangeText={setNewLahanInput}
            onSubmit={() => {
              // Kosongkan karena komponen katingmu sudah otomatis nge-push halaman
              console.log("Menyiapkan lahan baru...");
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  headerContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingTop: 50, paddingBottom: 18, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, position: "relative" },
  backButton: { position: "absolute", left: 16, bottom: 18, zIndex: 1 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", textAlign: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 46, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#1E293B" },
  italicText: { fontStyle: "italic" },
  normalText: { fontStyle: "normal" },
  listContainer: { gap: 12, marginBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#86EFAC",
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconContainer: { width: 48, height: 48, justifyContent: "center", alignItems: "center", marginRight: 12 },
  iconImage: { width: 28, height: 28, resizeMode: "contain" },
  cardContent: { flex: 1 },
  lahanName: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 4 },
  cropBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  cropText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  dateText: { fontSize: 11, color: "#64748B", alignSelf: "flex-start", marginTop: 2 },
});
