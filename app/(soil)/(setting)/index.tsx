// app/(soil)/(setting)/index.tsx
import React, { useEffect, useState } from "react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, Switch, TextInput, Alert
} from "react-native";
import { COLORS } from "@/constants";
import { useSensorStore } from "@/store/sensorContext";

export default function SettingScreen() {
  const { settings, updateSettings } = useSensorStore();
  
  // State Lokal untuk form input (belum langsung disimpan ke AsyncStorage)
  const [namaPetani, setNamaPetani] = useState(settings.farmerName);
  const [darkMode, setDarkMode] = useState(settings.darkMode);

  // Sinkronisasi state lokal jika data di store/global context berubah
  useEffect(() => {
    setNamaPetani(settings.farmerName);
    setDarkMode(settings.darkMode);
  }, [settings]);

  const handleNamaChange = (text: string) => {
    setNamaPetani(text);
  };

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value);
  };

  // Trigger simpan satu kali ke Context (RAM + AsyncStorage) ketika tombol ditekan
  const handleSave = async () => {
    try {
      await updateSettings({
        farmerName: namaPetani,
        darkMode: darkMode,
      });
      Alert.alert("Sukses", "Pengaturan berhasil disimpan!");
    } catch (e) {
      Alert.alert("Error", "Gagal menyimpan pengaturan.");
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Settings" />

      <ScrollView style={styles.container}>
        {/* Debug Section */}
        <Text style={styles.sectionLabel}>Debug</Text>
        <View style={styles.card}>
          <Text style={styles.settingText}>
            Tampilkan bandwidth kekuatan koneksi LORA main node dengan side node
          </Text>
        </View>

        {/* Pengaturan Koneksi */}
        <Text style={styles.sectionLabel}>Pengaturan Koneksi</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Tambah/ganti topik</Text>
          </TouchableOpacity>
        </View>

        {/* Nama Petani */}
        <Text style={styles.sectionLabel}>Set Nama Petani</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama..."
            placeholderTextColor="#aaa"
            value={namaPetani}
            onChangeText={handleNamaChange}
          />
        </View>

        {/* Dark Mode */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeChange}
              thumbColor={darkMode ? COLORS.primary : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
        </View>

        {/* Tombol Save diletakkan di dalam JSX utama, di bawah list card */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveText}>Save Pengaturan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 16 },
  sectionLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingText: { color: "#333", fontSize: 13, flex: 1, lineHeight: 20 },
  input: {
    color: "#333",
    fontSize: 14,
    paddingVertical: 4,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});