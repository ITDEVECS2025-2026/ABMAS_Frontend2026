import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AnalysisDropdown from "@/components/device/AnalysisDropdown";
import { VARIETAS_DATA } from "@/constants/pupukData";
import { AnalysisFormData } from "@/interfaces/Analysis";
import { COLORS, SPACING } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";  // ← tambah useLocalSearchParams
import { useSensorStore } from "@/store/sensorContext";       // ← tambah ini

type DropdownType = "varietas" | "pupuk" | null;

export default function AnalysisScreen() {
    const { sensorId } = useLocalSearchParams<{ sensorId: string }>();
    const [formData, setFormData] = useState<AnalysisFormData>({
        varietas: null,
        luasLahan: "",
        targetHasilPanen: "",
        selectedPupuk: null,
    });

    const [varietasLabel, setVarietasLabel] = useState<string>("");
    const [pupukLabel, setPupukLabel] = useState<string>("");
    const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);

    const selectedVarietasData = VARIETAS_DATA.find(
        (v) => v.value === formData.varietas
    );

    const handleVarietasSelect = (value: string, label: string) => {
        setFormData((prev) => ({
            ...prev,
            varietas: value,
            selectedPupuk: null,
        }));
        setVarietasLabel(label);
        setPupukLabel("");
    };

    const handlePupukSelect = (value: string, label: string) => {
        setFormData((prev) => ({ ...prev, selectedPupuk: value }));
        setPupukLabel(label);
    };

    const handleNext = () => {
        router.push("/(soil)/(sensor)");
    };

    const sensorCards = [
        { label: "Nitrogen", value: 1234 },
        { label: "Fosfat", value: 1234 },
        { label: "Kalium", value: 1234 },
        { label: "EC", value: 1234 },
        { label: "pH", value: 1234 },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analisis Data Pupuk</Text>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Sensor Cards Grid */}
    {/* Sensor Cards Grid */}
<View style={styles.cardGrid}>
    {/* Render semua kartu kecuali yang terakhir jika ganjil */}
    {sensorCards.slice(0, sensorCards.length % 2 !== 0 ? -1 : sensorCards.length).map((item, index) => (
        <View key={String(index)} style={styles.cardWrapper}>
            <View style={styles.sensorCard}>
                <View style={styles.sensorCardHeader}>
                    <Text style={styles.sensorLabel}>{item.label}</Text>
                </View>
                <View style={styles.sensorCardBody}>
                    <Text style={styles.sensorValue}>{item.value}</Text>
                </View>
            </View>
        </View>
    ))}

    {/* Jika jumlah kartu ganjil, render kartu terakhir di baris sendiri */}
    {sensorCards.length % 2 !== 0 && (
        <View style={styles.cardWrapperCenter}>
            <View style={styles.sensorCard}>
                <View style={styles.sensorCardHeader}>
                    <Text style={styles.sensorLabel}>
                        {sensorCards[sensorCards.length - 1].label}
                    </Text>
                </View>
                <View style={styles.sensorCardBody}>
                    <Text style={styles.sensorValue}>
                        {sensorCards[sensorCards.length - 1].value}
                    </Text>
                </View>
            </View>
        </View>
    )}
</View>
                {/* Varietas Dropdown */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Varietas</Text>
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setActiveDropdown("varietas")}
                    >
                        <Text
                            style={[
                                styles.dropdownButtonText,
                                !varietasLabel && styles.dropdownPlaceholder,
                            ]}
                        >
                            {varietasLabel || "Pilih varietas..."}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Pupuk Dropdown */}
                {formData.varietas && (
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Pemilihan Pupuk</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setActiveDropdown("pupuk")}
                        >
                            <Text
                                style={[
                                    styles.dropdownButtonText,
                                    !pupukLabel && styles.dropdownPlaceholder,
                                ]}
                            >
                                {pupukLabel || "Pilih pupuk..."}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Luas Lahan */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Luas Lahan</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={formData.luasLahan}
                            onChangeText={(val) =>
                                setFormData((prev) => ({ ...prev, luasLahan: val }))
                            }
                            placeholderTextColor="#aaa"
                        />
                        <Text style={styles.unitText}>Hektar</Text>
                    </View>
                </View>

                {/* Target Hasil Panen */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Target Hasil Panen</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={formData.targetHasilPanen}
                            onChangeText={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    targetHasilPanen: val,
                                }))
                            }
                            placeholderTextColor="#aaa"
                        />
                        <Text style={styles.unitText}>Ton/Hektar</Text>
                    </View>
                </View>

                {/* Next Button */}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>NEXT</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Dropdown Modal: Varietas */}
            <AnalysisDropdown
                visible={activeDropdown === "varietas"}
                title="Pilih Varietas"
                options={VARIETAS_DATA.map((v) => ({
                    label: v.label,
                    value: v.value,
                }))}
                selectedValue={formData.varietas}
                onSelect={handleVarietasSelect}
                onClose={() => setActiveDropdown(null)}
            />

            {/* Dropdown Modal: Pupuk */}
            {selectedVarietasData && (
                <AnalysisDropdown
                    visible={activeDropdown === "pupuk"}
                    title="Pemilihan Pupuk"
                    options={selectedVarietasData.pupukOptions}
                    selectedValue={formData.selectedPupuk}
                    onSelect={handlePupukSelect}
                    onClose={() => setActiveDropdown(null)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2e7d32",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Sensor Cards
    cardGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 24,
    },
    cardWrapper: {
        width: "47%",
    },
    cardWrapperCenter: {
        alignSelf: "center",  // ← kartu pH di tengah
        width: "47%",  
        marginLeft: "auto",
        marginRight: "auto",       // ← lebar sama dengan kartu lain
    },
    sensorCard: {
        width: "100%",
        borderRadius: 6,
        overflow: "hidden",
    },
    sensorCardHeader: {
        backgroundColor: COLORS.primaryDark,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        alignItems: "center",  // ← label teks di tengah
    },
    sensorLabel: {
        color: COLORS.white,
        fontWeight: "700",
        fontSize: 13,
    },
    sensorCardBody: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
    },
    sensorValue: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
    },

    // Form Fields
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 6,
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2e7d32",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    dropdownButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    dropdownPlaceholder: {
        color: "rgba(255,255,255,0.5)",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2e7d32",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    textInput: {
        flex: 1,
        color: "#fff",
        fontSize: 14,
        paddingVertical: 8,
    },
    unitText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 8,
    },

    // Next Button
    nextButton: {
        backgroundColor: "#1b5e20",
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 12,
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 2,
    },
});