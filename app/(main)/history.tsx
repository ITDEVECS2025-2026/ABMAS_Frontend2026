import React, { useState } from "react";
import { SafeAreaView, View, TextInput, StyleSheet, Text, StatusBar, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Data awal riwayat lahan
const INITIAL_DATA = [
  {
    id: "1",
    name: "Lahan Pak Mateno",
    crop: "Tanaman Jagung",
    date: "14 Juli 2026",
    icon: "🌽", // Menggunakan emoji agar langsung muncul tanpa perlu aset gambar
  },
  {
    id: "2",
    name: "Lahan Pak Munadi",
    crop: "Tanaman Padi",
    date: "15 Juli 2026",
    icon: "🌾",
  },
];

export default function HistoryPage() {
  // 1. State untuk Pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // 2. State untuk Data List Lahan
  const [lahanList, setLahanList] = useState(INITIAL_DATA);

  // 3. State untuk Input Lahan Baru (Untuk mengatur variasi tampilan)
  const [newLahanInput, setNewLahanInput] = useState("");

  // Fungsi untuk menambah lahan baru ke dalam list
  const handleAddLahan = () => {
    if (newLahanInput.trim() === "") return;

    const newItem = {
      id: Date.now().toString(),
      name: newLahanInput,
      crop: "Tanaman Baru", // Default tanaman
      date: "Hari ini",
      icon: "🌱",
    };

    setLahanList([...lahanList, newItem]);
    setNewLahanInput(""); // Reset input ke state kosong (kembali ada ikon pena)
  };

  // Filter daftar lahan berdasarkan search bar
  const filteredLahan = lahanList.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* =========================================================
          1. HEADER DENGAN LINEAR GRADIENT (KIRI KE KANAN)
      ========================================================== */}
      <LinearGradient
        // Warna dari Kiri (Hijau Hutan/Gelap) ke Kanan (Hijau Zaitun/Kekuningan)
        colors={["#1b5e20", "#4d6b13", "#767614"]}
        start={{ x: 0, y: 0.5 }} // Mulai dari tengah-kiri
        end={{ x: 1, y: 0.5 }} // Berakhir di tengah-kanan
        style={styles.headerContainer}
      >
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>History Pemupukan</Text>
      </LinearGradient>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* =========================================================
            2. SEARCH BAR
        ========================================================== */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput style={[styles.searchInput, searchQuery.length === 0 ? styles.italicText : styles.normalText]} placeholder="Cari Nama Lahan.." placeholderTextColor="#64748B" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* =========================================================
            3. DAFTAR RIWAYAT LAHAN (LIST CARDS)
        ========================================================== */}
        <View style={styles.listContainer}>
          {filteredLahan.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* Ikon Tanaman */}
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>

              {/* Info Lahan */}
              <View style={styles.cardContent}>
                <Text style={styles.lahanName}>{item.name}</Text>

                {/* --- GANTI BAGIAN INI DENGAN LINEAR GRADIENT --- */}
                <LinearGradient
                  colors={["#166534", "#4d6b13", "#767614"]} // Gradasi hijau gelap ke hijau kekuningan
                  start={{ x: 0, y: 0.5 }} // Mulai dari kiri
                  end={{ x: 1, y: 0.5 }} // Berakhir di kanan
                  style={styles.cropBadge}
                >
                  <Text style={styles.cropText}>{item.crop}</Text>
                </LinearGradient>
                {/* ----------------------------------------------- */}
              </View>

              {/* Tanggal */}
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          ))}
        </View>
        {/* =========================================================
            4. KARTU TAMBAH LAHAN & VARIASI STATE INPUT
        ========================================================== */}
        <LinearGradient
          // Menggunakan kombinasi warna gradasi yang sama dengan header
          colors={["#1b5e20", "#4d6b13", "#767614"]}
          start={{ x: 0, y: 0.5 }} // Mulai dari tengah-kiri
          end={{ x: 1, y: 0.5 }} // Berakhir di tengah-kanan
          style={styles.addCardContainer}
        >
          {/* Judul Tambah Lahan */}
          <View style={styles.addCardHeader}>
            <View style={styles.plusIconBadge}>
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.addCardTitle}>Tambah Lahan</Text>
          </View>

          {/* Kotak Input Lahan Baru */}
          <View style={styles.newInputContainer}>
            <TextInput style={[styles.newInput, newLahanInput.length === 0 ? styles.italicText : styles.normalText]} placeholder="Contoh : Lahan 1" placeholderTextColor="#64748B" value={newLahanInput} onChangeText={setNewLahanInput} />

            {newLahanInput.length === 0 ? (
              <Ionicons name="create-outline" size={24} color="#166534" />
            ) : (
              <TouchableOpacity style={styles.btnTambah} onPress={handleAddLahan}>
                <Text style={styles.btnTambahText}>Tambah</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

// =========================================================
// STYLESHEET
// =========================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // <-- 1. Tambahkan ini agar semua isi header langsung di tengah
    paddingHorizontal: 16,
    paddingVertical: 18,
    paddingTop: 50, // <-- Tambahkan paddingTop agar tidak menempel ke status bar
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: "relative", // <-- 2. Tambahkan ini sebagai acuan posisi tombol back
  },
  backButton: {
    position: "absolute", // <-- 3. Buat tombol melayang agar tidak mendorong teks
    left: 16, // <-- 4. Posisikan di kiri (jaraknya sama dengan paddingHorizontal)
    zIndex: 1, // <-- 5. Pastikan tombol tetap bisa diklik (di atas layar)
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // --- Search Bar ---
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },
  italicText: {
    fontStyle: "italic",
  },
  normalText: {
    fontStyle: "normal",
  },
  // --- Daftar Lahan (Card Item) ---
  listContainer: {
    gap: 12, // Jarak antar kartu
    marginBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#86EFAC", // Border hijau muda tipis
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  lahanName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  cropBadge: {
    backgroundColor: "#22C55E", // Badge hijau padi/jagung
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  cropText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  // --- Kartu Tambah Lahan (Bottom Section) ---
  addCardContainer: {
    borderRadius: 16,
    padding: 16,
  },
  addCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  plusIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#588157",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  addCardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  // --- Input Lahan Baru & Variasi Tombol ---
  newInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  newInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    height: "100%",
  },
  btnTambah: {
    backgroundColor: "#166534", // Warna tombol hijau gelap saat muncul
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnTambahText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
