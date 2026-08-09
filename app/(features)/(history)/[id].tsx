import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useRekomendasiStore } from "@/store/rekomendasiStore";

export default function HistoryDetailScreen() {
    const params = useLocalSearchParams();
    const sensorId = String(params.id);
    
    // 👇 REVISI: Subscribe langsung ke state agar otomatis re-render saat data termuat dari AsyncStorage
    const hasil = useRekomendasiStore((state) => state.rekomendasiData[sensorId]);

    if (!hasil) {
        return (
            <SafeAreaView style={styles.safe}>
                <ScreenHeader title={`Sensor ${sensorId}`} />
                <Text style={{ color: COLORS.text, textAlign: "center", marginTop: 40, fontFamily: "PoppinsMedium" }}>
                    Belum ada riwayat rekomendasi pemupukan untuk sensor ini.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScreenHeader title={`Sensor ${sensorId}`} />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* ── Kondisi Tanah ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Kondisi Tanah</Text>
                        <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.sectionSub}>Tanggal Awal Pemupukan: Data Tersimpan</Text>

                    <View style={styles.soilGrid}>
                        {["N", "P", "K"].map((label) => (
                            <View key={label} style={styles.soilCard}>
                                <View style={styles.soilCardHeader}><Text style={styles.soilCardLabel}>{label}</Text></View>
                                <View style={styles.soilCardBody}><Text style={styles.soilCardValue}>100</Text></View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.soilGrid}>
                        {["EC", "pH"].map((label) => (
                            <View key={label} style={styles.soilCard}>
                                <View style={styles.soilCardHeader}><Text style={styles.soilCardLabel}>{label}</Text></View>
                                <View style={styles.soilCardBody}><Text style={styles.soilCardValue}>100</Text></View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Rekomendasi Jadwal (DI-RENDER DARI ZUSTAND) ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rekomendasi</Text>
                    {hasil.jadwal.map((fase: any, idx: number) => (
                        <View key={idx} style={styles.rekomendasiCard}>
                            <View style={styles.rekomendasiHeaderRow}>
                                <Text style={styles.rekomendasiLabel}>Pemupukan ke-{idx + 1}</Text>
                                <Text style={styles.rekomendasiHst}>{fase.fase}</Text>
                            </View>
                            
                            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                                {["urea", "sp36", "kcl", "npk"].map((jenis) => {
                                    if (fase[jenis] !== undefined) {
                                        return (
                                            <View key={jenis} style={{ flexBasis: "31%", borderRadius: 6, overflow: "hidden" }}>
                                                <View style={{ backgroundColor: "#58C15C", paddingVertical: 4, alignItems: "center" }}>
                                                    <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: 12, textTransform: "uppercase" }}>{jenis}</Text>
                                                </View>
                                                <View style={{ backgroundColor: "#105C2E", paddingVertical: 8, alignItems: "center" }}>
                                                    <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: 13 }}>{fase[jenis]} kg</Text>
                                                </View>
                                            </View>
                                        );
                                    }
                                    return null;
                                })}
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Peringatan (DI-RENDER DARI ZUSTAND) ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Peringatan</Text>
                    {hasil.warnings && hasil.warnings.length > 0 ? (
                        hasil.warnings.map((warn: any, idx: number) => (
                            <View key={idx} style={{ backgroundColor: "#105C2E", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsRegular", fontSize: 11, textAlign: "justify", lineHeight: 18 }}>
                                    {warn.pesan}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View style={{ backgroundColor: "#E8F5E9", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#58C15C" }}>
                            <Text style={{ color: "#105C2E", fontFamily: "PoppinsMedium", fontSize: 12, textAlign: "center" }}>
                                Kondisi tanah sangat optimal.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, padding: 16 },
    section: { marginBottom: 20 },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { color: COLORS.text, fontFamily: "PoppinsBold", fontSize: 15, marginBottom: 4 },
    sectionSub: { color: COLORS.textMuted, fontFamily: "PoppinsMedium", fontSize: 11, marginBottom: 10 },
    soilGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
    soilCard: { flex: 1, borderRadius: 6, overflow: "hidden" },
    soilCardHeader: { backgroundColor: COLORS.primaryDark, paddingVertical: 6, alignItems: "center" },
    soilCardLabel: { color: "#fff", fontFamily: "PoppinsBold", fontSize: 13 },
    soilCardBody: { backgroundColor: COLORS.primary, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
    soilCardValue: { color: "#fff", fontFamily: "PoppinsBold", fontSize: 12 },
    rekomendasiCard: { backgroundColor: "#B7E4B9", borderRadius: 12, padding: 12, marginBottom: 12 },
    rekomendasiHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    rekomendasiLabel: { color: COLORS.primaryDark, fontFamily: "PoppinsBold", fontSize: 13 },
    rekomendasiHst: { color: COLORS.primaryDark, fontFamily: "PoppinsMedium", fontSize: 12 },
});