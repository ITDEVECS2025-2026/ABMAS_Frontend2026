import React, { useState } from "react";
import { View, Text, Image, Pressable, ScrollView, StatusBar, Modal, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ruler, Target, Radio, Map, MapPin, ArrowLeft, Sprout, Calendar, ChevronDown, Tag } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { scale } from "../../../utils/scale";
import { useLahanStore } from "../../../store/lahanStore";

// ✅ IMPORT KOMPONEN SENSOR KATINGMU
import SensorMetricCard from "../../../components/sensor/SensorMetricCard";
import { saveHarvestData } from "@/lib/api";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

const SENSOR_IDS = ["1", "2", "3", "4", "5"];
const VARIETAS_OPTIONS = ["Tunggal (Urea, Sp36, KCl)", "Majemuk Phonska (15:15:15)", "Majemuk Phonska (15:10:12)"];

export default function MonitoringLahanTersimpanPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { getLahanById, getRentangSensorId } = useLahanStore();

    const idLahan = params.idLahan ? String(params.idLahan) : null;
    const dataLahanStore = idLahan ? getLahanById(idLahan) : null;
    const rentangSensor = idLahan
        ? getRentangSensorId(idLahan)
        : undefined;

    const namaLahan = dataLahanStore?.namaLahan || (params.namaLahan ? String(params.namaLahan) : "Lahan");
    const tanaman = dataLahanStore?.tanaman || (params.tanaman ? String(params.tanaman) : "PADI");

    let tanggalTanam = "-";
    if (dataLahanStore?.tanggalTanam) {
        tanggalTanam = new Date(dataLahanStore.tanggalTanam).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    } else if (params.tanggalTanam) {
        tanggalTanam = String(params.tanggalTanam);
    }

    const luasLahan = dataLahanStore?.luasLahan ? String(dataLahanStore.luasLahan) : params.luasLahan ? String(params.luasLahan) : "-";
    const targetPanen = dataLahanStore?.targetPanen ? String(dataLahanStore.targetPanen) : params.targetPanen ? String(params.targetPanen) : "-";
    const alamat = dataLahanStore?.lokasi?.alamat || (params.alamat ? String(params.alamat) : "-");
    const lat = dataLahanStore?.lokasi?.lat ? String(dataLahanStore.lokasi.lat) : params.lat ? String(params.lat) : "";
    const lon = dataLahanStore?.lokasi?.lon ? String(dataLahanStore.lokasi.lon) : params.lon ? String(params.lon) : "";

    const tanamanIcon = tanaman === "JAGUNG" ? jagungIcon : padiIcon;
    const tanamanLabel = tanaman === "JAGUNG" ? "Tanaman Jagung" : "Tanaman Padi";

    // STATE APLIKASI
    const [activeTab, setActiveTab] = useState("monitoring");
    const [isPanen, setIsPanen] = useState(false);
    const [isModalPanenVisible, setIsModalPanenVisible] = useState(false);
    const [inputHasilPanen, setInputHasilPanen] = useState("");

    const [hasRekomendasi, setHasRekomendasi] = useState(false);
    const [showFormPupuk, setShowFormPupuk] = useState(false);

    const [datePupuk, setDatePupuk] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [formattedDatePupuk, setFormattedDatePupuk] = useState("");

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedVarietas, setSelectedVarietas] = useState("");

    // 👇 HELPER KONDISI TANAH (MENGGUNAKAN KOMPONEN KATINGMU) 👇
    const RenderGridKondisiTanah = () => (
        <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(10) }}>
                {/* Harus pakai casting 'as any' karena TS strict sama MetricType, aman kok! */}
                <SensorMetricCard type={"N" as any} value={100} />
                <SensorMetricCard type={"P" as any} value={100} />
                <SensorMetricCard type={"K" as any} value={100} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(10) }}>
                <SensorMetricCard type={"EC" as any} value={100} />
                <SensorMetricCard type={"pH" as any} value={100} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(24) }}>
                <SensorMetricCard type={"Suhu" as any} value={100} />
                <SensorMetricCard type={"Kelembaban" as any} value={100} />
            </View>
        </>
    );

    const RenderLokasiSawah = () => (
        <View style={{ width: "100%", borderRadius: scale(6.05), borderWidth: scale(0.403), borderColor: "#006134", backgroundColor: "#FFFFFF", overflow: "hidden", alignSelf: "center" }}>
            <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1.6, y: 1 }} style={{ width: "100%", height: scale(47), flexDirection: "row", alignItems: "center", justifyContent: "center", gap: scale(8) }}>
                <Map size={scale(20)} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(18) }}>Lokasi Sawah</Text>
            </LinearGradient>
            <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), padding: scale(12) }}>
                <MapPin size={scale(27)} color="#006134" />
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={2} style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>
                        {alamat}
                    </Text>
                    {lat && lon ? (
                        <Text style={{ color: "#4A5468", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(12), marginTop: scale(2) }}>
                            Koordinat: {Number(lat).toFixed(3)}, {Number(lon).toFixed(3)}
                        </Text>
                    ) : null}
                </View>
            </View>
        </View>
    );

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDatePupuk(selectedDate);
            const day = String(selectedDate.getDate()).padStart(2, "0");
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const year = selectedDate.getFullYear();
            setFormattedDatePupuk(`${day}/${month}/${year}`);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            {/* MODAL PANEN */}
            <Modal visible={isModalPanenVisible} transparent={true} animationType="fade">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "#FFFFFF", width: scale(310), borderRadius: scale(16), padding: scale(20) }}>
                        <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18), color: "#1A202C", marginBottom: scale(16) }}>Hasil Panen</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: scale(8), paddingHorizontal: scale(12), height: scale(45), marginBottom: scale(24) }}>
                            <TextInput
                                style={{ flex: 1, fontFamily: "PoppinsRegular", fontSize: scale(13), color: "#1A202C" }}
                                placeholder="Masukkan hasil panen..."
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={inputHasilPanen}
                                onChangeText={setInputHasilPanen}
                            />
                            <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(13), color: "#64748B", fontStyle: "italic" }}>ton/Hektar</Text>
                        </View>
                        <Pressable
                            onPress={async () => {
                                try {
                                    await saveHarvestData({
                                        namaLahan: namaLahan,
                                        tanaman: tanaman,
                                        tanggalTanam: dataLahanStore?.tanggalTanam
                                            ? new Date(dataLahanStore.tanggalTanam).toISOString()
                                            : new Date().toISOString(),
                                        luasLahan: Number(luasLahan) || 0,
                                        targetPanen: Number(targetPanen) || 0,
                                        hasilPanenAktual: Number(inputHasilPanen) || 0,

                                        // 👇 Tambahkan objek rentangSensor di sini (diubah jadi string)
                                        rentangSensor: {
                                            sensorIdAwal: String(rentangSensor?.dari ?? 0),
                                            sensorIdAkhir: String(rentangSensor?.sampai ?? 0)
                                        }
                                    });

                                    setIsModalPanenVisible(false);
                                    setIsPanen(true);

                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                        >
                            <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(8), paddingVertical: scale(12), alignItems: "center" }}>
                                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(15) }}>Simpan</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: scale(40) }} showsVerticalScrollIndicator={false}>
                {/* HEADER & INFO LAHAN */}
                <LinearGradient
                    colors={["#1b5e20", "#4d6b13", "#767614"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ width: "100%", paddingTop: scale(50), paddingBottom: scale(24), borderBottomLeftRadius: scale(24), borderBottomRightRadius: scale(24), alignItems: "center" }}
                >
                    <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", marginBottom: scale(20), paddingHorizontal: scale(16) }}>
                        <Pressable onPress={() => router.back()} style={{ position: "absolute", left: scale(16), zIndex: 1 }}>
                            <ArrowLeft color="#FFFFFF" size={scale(24)} />
                        </Pressable>
                        <Text style={{ color: "#FFFFFF", fontSize: scale(20), fontFamily: "PoppinsBold" }}>Data Lahan</Text>
                    </View>

                    <View style={{ width: scale(336), height: scale(120), borderRadius: scale(16), backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: scale(18), elevation: 4 }}>
                        <Image source={tanamanIcon} style={{ width: scale(49.372), height: scale(64.666), resizeMode: "contain" }} />
                        <View style={{ flex: 1, marginLeft: scale(12) }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingRight: scale(8) }}>
                                <Text style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(17), flex: 1 }} numberOfLines={1}>
                                    {namaLahan}
                                </Text>
                                <Text style={{ color: "#000000", fontFamily: "PoppinsMedium", fontSize: scale(11), marginLeft: scale(6), marginTop: scale(4) }}>{tanggalTanam}</Text>
                            </View>
                            <View style={{ width: scale(128.564), height: scale(20), borderRadius: scale(5.117), marginBottom: scale(6), overflow: "hidden" }}>
                                <LinearGradient colors={["#187245", "#58C15C"]} start={{ x: 0, y: 0 }} end={{ x: 1.3, y: 0 }} style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(12.5) }}>{tanamanLabel}</Text>
                                </LinearGradient>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(-3) }}>
                                <Ruler size={scale(15)} color="#1A202C" />
                                <Text style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>Luas Lahan : </Text>
                                <Text style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>{luasLahan} Hektar</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Target size={scale(13)} color="#000000" />
                                <Text style={{ color: "#000000", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>Target Panen : </Text>
                                <Text style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>{targetPanen} ton/Hektar</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "center", gap: scale(12), marginTop: scale(16) }}>
                        <Pressable
                            onPress={() => setActiveTab("monitoring")}
                            style={{ flexDirection: "row", alignItems: "center", backgroundColor: activeTab === "monitoring" ? "#E8F5E9" : "#FFFFFF", paddingVertical: scale(10), paddingHorizontal: scale(24), borderRadius: scale(20) }}
                        >
                            <Text style={{ color: "#006134", fontFamily: "PoppinsSemiBold", fontSize: scale(14) }}>Monitoring</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setActiveTab("pemupukan")}
                            style={{ flexDirection: "row", alignItems: "center", backgroundColor: activeTab === "pemupukan" ? "#E8F5E9" : "#FFFFFF", paddingVertical: scale(10), paddingHorizontal: scale(24), borderRadius: scale(20) }}
                        >
                            <Text style={{ color: "#006134", fontFamily: "PoppinsSemiBold", fontSize: scale(14) }}>Pemupukan</Text>
                        </Pressable>
                    </View>
                </LinearGradient>

                <View style={{ marginTop: scale(20), alignItems: "center", paddingHorizontal: scale(20) }}>
                    {isPanen ? (
                        /* --- STATE 1: SUDAH PANEN --- */
                        <View style={{ width: "100%", alignItems: "center", marginTop: scale(30) }}>
                            <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(14), color: "#1A202C", marginBottom: scale(20) }}>Telah dipanen pada tanggal 22 Juli 2026</Text>
                            <Pressable onPress={() => router.replace({ pathname: "/(features)/(lahan)", params: { namaLahan } } as any)} style={{ width: scale(200) }}>
                                <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(12), alignItems: "center", elevation: 3 }}>
                                    <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>Tanam Lagi</Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    ) : activeTab === "monitoring" ? (
                        /* --- STATE 2: TAB MONITORING --- */
                        <View style={{ width: "100%", alignItems: "center" }}>
                            <Text style={{ fontFamily: "PoppinsRegular", fontSize: scale(12), textAlign: "center", marginBottom: scale(10) }}>Sistem telah merekam pembaruan kondisi tanah terakhir</Text>
                            <View style={{ width: scale(336), alignSelf: "center" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: scale(6) }}>
                                    <Radio size={scale(26)} color="#1A202C" />
                                    <Text style={{ color: "#1A202C", fontFamily: "PoppinsBold", fontSize: scale(18) }}>Daftar Sensor</Text>
                                </View>
                                {SENSOR_IDS.map((id) => (
                                    <Pressable
                                        key={id}
                                        onPress={() => router.push({ pathname: "/(features)/(sensor)/[id]", params: { id, namaLahan, tanaman, tanggalTanam, luasLahan, targetPanen, alamat, lat, lon } } as any)}
                                        style={{ marginBottom: scale(8) }}
                                    >
                                        <LinearGradient
                                            colors={["#105C2E", "#8C6A09"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1.6, y: 0 }}
                                            style={{ width: "100%", height: scale(43.788), borderRadius: scale(9.759), justifyContent: "center", alignItems: "center", elevation: 3 }}
                                        >
                                            <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: scale(18) }}>Sensor {id}</Text>
                                        </LinearGradient>
                                    </Pressable>
                                ))}
                            </View>
                            <View style={{ marginTop: scale(24), width: scale(336) }}>
                                <RenderLokasiSawah />
                            </View>
                        </View>
                    ) : (
                        /* --- STATE 3: TAB PEMUPUKAN --- */
                        <View style={{ width: "100%" }}>
                            {!hasRekomendasi ? (
                                !showFormPupuk ? (
                                    /* Fase 3A: Kosong */
                                    <View style={{ alignItems: "center", marginTop: scale(30) }}>
                                        <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(14), color: "#1A202C", marginBottom: scale(16), textAlign: "center" }}>Anda belum melakukan rekomendasi pemupukan</Text>
                                        <Pressable onPress={() => setShowFormPupuk(true)} style={{ width: scale(200) }}>
                                            <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(12), alignItems: "center" }}>
                                                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(15) }}>Isi Data Pupuk</Text>
                                            </LinearGradient>
                                        </Pressable>
                                    </View>
                                ) : (
                                    /* Fase 3B: Form Isi Data Pupuk */
                                    <View style={{ width: "100%" }}>
                                        <RenderGridKondisiTanah />

                                        <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6), marginBottom: scale(8) }}>
                                            <Radio size={scale(18)} color="#1A202C" />
                                            <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(15), color: "#1A202C" }}>Tanggal Mulai Pemupukan</Text>
                                        </View>
                                        <Pressable
                                            onPress={() => setShowDatePicker(true)}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                borderWidth: 1,
                                                borderColor: "#CBD5E1",
                                                borderRadius: scale(8),
                                                paddingHorizontal: scale(12),
                                                height: scale(45),
                                                marginBottom: scale(20),
                                                backgroundColor: "#FFFFFF",
                                            }}
                                        >
                                            <Text style={{ flex: 1, fontFamily: "PoppinsRegular", fontSize: scale(14), color: formattedDatePupuk ? "#1A202C" : "#94A3B8" }}>{formattedDatePupuk || "dd/mm/yyyy"}</Text>
                                            <Calendar size={scale(20)} color="#1A202C" />
                                        </Pressable>

                                        {showDatePicker && <DateTimePicker value={datePupuk} mode="date" display="default" onChange={onChangeDate} />}

                                        <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6), marginBottom: scale(8) }}>
                                            <Tag size={scale(18)} color="#1A202C" />
                                            <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(15), color: "#1A202C" }}>Pilih Varietas</Text>
                                        </View>

                                        <View style={{ zIndex: 10, marginBottom: scale(24) }}>
                                            <Pressable
                                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    borderWidth: 1,
                                                    borderColor: "#CBD5E1",
                                                    borderRadius: scale(8),
                                                    paddingHorizontal: scale(12),
                                                    height: scale(45),
                                                    backgroundColor: "#FFFFFF",
                                                }}
                                            >
                                                <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(13), color: selectedVarietas ? "#1A202C" : "#94A3B8" }}>{selectedVarietas || "Klik Untuk Memilih"}</Text>
                                                <ChevronDown size={scale(20)} color="#1A202C" />
                                            </Pressable>
                                            {isDropdownOpen && (
                                                <View style={{ position: "absolute", top: scale(50), left: 0, right: 0, backgroundColor: "#FFFFFF", borderRadius: scale(8), borderWidth: 1, borderColor: "#CBD5E1", elevation: 5, paddingVertical: scale(4) }}>
                                                    {VARIETAS_OPTIONS.map((item, index) => (
                                                        <Pressable
                                                            key={index}
                                                            onPress={() => {
                                                                setSelectedVarietas(item);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            style={{ paddingVertical: scale(10), paddingHorizontal: scale(12), borderBottomWidth: index !== VARIETAS_OPTIONS.length - 1 ? 1 : 0, borderBottomColor: "#F1F5F9" }}
                                                        >
                                                            <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(13), color: "#1A202C" }}>{item}</Text>
                                                        </Pressable>
                                                    ))}
                                                </View>
                                            )}
                                        </View>

                                        <RenderLokasiSawah />
                                        <Pressable style={{ marginTop: scale(24), marginBottom: scale(20) }} onPress={() => setHasRekomendasi(true)}>
                                            <LinearGradient colors={["#105C2E", "#588157"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(14), alignItems: "center" }}>
                                                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>Rekomendasi</Text>
                                            </LinearGradient>
                                        </Pressable>
                                    </View>
                                )
                            ) : (
                                /* Fase 3C: Hasil Rekomendasi */
                                <View style={{ width: "100%" }}>
                                    <View style={{ alignItems: "center", marginBottom: scale(16) }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6) }}>
                                            <Sprout size={scale(20)} color="#1A202C" />
                                            <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18), color: "#1A202C" }}>Kondisi Tanah</Text>
                                        </View>
                                        <Text style={{ fontFamily: "PoppinsRegular", fontSize: scale(10), color: "#4A5468", marginTop: scale(2) }}>Tanggal Awal Pemupukan: 22 Juli 2026</Text>
                                    </View>

                                    <RenderGridKondisiTanah />

                                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#1A202C", marginBottom: scale(8) }}>Pupuk</Text>
                                    <View style={{ backgroundColor: "#105C2E", borderRadius: scale(10), padding: scale(12), flexDirection: "row", justifyContent: "space-between", marginBottom: scale(24) }}>
                                        {["Nitrogen", "Kalium", "Fosfat"].map((item, index) => {
                                            const vals = ["Urea", "KCL", "SP-36"];
                                            return (
                                                <View key={item} style={{ width: "31%", borderRadius: scale(6), overflow: "hidden" }}>
                                                    <View style={{ backgroundColor: "#4CAF50", paddingVertical: scale(6), alignItems: "center" }}>
                                                        <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: scale(11) }}>{item}</Text>
                                                    </View>
                                                    <View style={{ backgroundColor: "#D4EDDA", paddingVertical: scale(8), alignItems: "center" }}>
                                                        <Text style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(12) }}>{vals[index]}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#1A202C", marginBottom: scale(8) }}>Rekomendasi</Text>
                                    {[
                                        { id: 1, hst: 7 },
                                        { id: 2, hst: 28 },
                                        { id: 3, hst: 45 },
                                    ].map((item) => (
                                        <View key={item.id} style={{ backgroundColor: "#B7E4B9", borderRadius: scale(12), padding: scale(12), marginBottom: scale(12) }}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(10) }}>
                                                <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(13), color: "#1A202C" }}>Pemupukan ke-{item.id}</Text>
                                                <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(12), color: "#1A202C" }}>{item.hst} HST</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                {["Urea", "SP-36", "KCL"].map((pupuk) => (
                                                    <View key={pupuk} style={{ width: "31%", borderRadius: scale(6), overflow: "hidden" }}>
                                                        <View style={{ backgroundColor: "#58C15C", paddingVertical: scale(4), alignItems: "center" }}>
                                                            <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: scale(12) }}>{pupuk}</Text>
                                                        </View>
                                                        <View style={{ backgroundColor: "#105C2E", paddingVertical: scale(8), alignItems: "center" }}>
                                                            <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>100</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}

                                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#1A202C", marginTop: scale(12), marginBottom: scale(8) }}>Peringatan</Text>
                                    <View style={{ backgroundColor: "#105C2E", borderRadius: scale(12), padding: scale(16), marginBottom: scale(24) }}>
                                        <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsRegular", fontSize: scale(11), textAlign: "justify", lineHeight: scale(18) }}>
                                            Kondisi tanah tidak optimal. pH dan salinitas berada di luar batas normal, perlu penanganan segera agar tidak mengganggu pertumbuhan tanaman.
                                        </Text>
                                    </View>

                                    <Pressable style={{ marginBottom: scale(20) }} onPress={() => setIsModalPanenVisible(true)}>
                                        <LinearGradient colors={["#105C2E", "#588157"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(14), alignItems: "center" }}>
                                            <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>Panen Sekarang!</Text>
                                        </LinearGradient>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}