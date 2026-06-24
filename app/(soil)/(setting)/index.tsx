// app/(soil)/(setting)/index.tsx
import React, { useEffect, useState } from "react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, TextInput, Alert
} from "react-native";
import { COLORS } from "@/constants";
import { useSensorStore } from "@/store/sensorContext";

export default function SettingScreen() {
  const { settings, updateSettings } = useSensorStore();

  const [namaPetani, setNamaPetani] = useState(settings.farmerName);

  useEffect(() => {
    setNamaPetani(settings.farmerName);
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({ farmerName: namaPetani });
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
        <Text style={styles.sectionLabel}>Set Nama Petani</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama..."
            placeholderTextColor="#aaa"
            value={namaPetani}
            onChangeText={setNamaPetani}
          />
        </View>

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