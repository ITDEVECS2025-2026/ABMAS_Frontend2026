// app/(features)/(varietas)/[id].tsx
import React, { useState } from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { CalendarClock, Sprout, MapPin, ChevronDown, ChevronUp, Ruler, Target } from "lucide-react-native";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SensorCard from "@/components/sensor/SensorCardGrid";
import { scale } from "@/utils/scale";
import { getTimeAgo } from "@/utils/gps";
import { useSensorStore } from "@/store/sensorContext";
import { VARIETAS_PADI, VARIETAS_JAGUNG, VarietasPupuk } from "@/constants/pupukData";
import { useLahanStore } from "@/store/lahanStore";
import { API_URL } from "@/lib/config";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");
const [sensorIdAwal, setSensorIdAwal] = useState<number | null>(null);

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

export default function DataPemupukanPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const params = useLocalSearchParams();
    const setRentangSensorId = useLahanStore((state) => state.setRentangSensorId);
    // Mengambil data sensor dari context/store global
    const { getSensorById } = useSensorStore();
    const sensor = getSensorById(id as string);

    // Mengecek apakah sensor memiliki lokasi valid
    const hasLocation = !!sensor?.location && sensor.location.latitude !== 0 && sensor.location.longitude !== 0;

    const namaLahan = params.namaLahan ? String(params.namaLahan) : "Lahan";
    const tanaman = params.tanaman ? String(params.tanaman) : "PADI";
    const tanggalTanam = params.tanggalTanam ? String(params.tanggalTanam) : "-";
    const luasLahan = params.luasLahan ? String(params.luasLahan) : "-";
    const targetPanen = params.targetPanen ? String(params.targetPanen) : "-";
    const alamat = params.alamat ? String(params.alamat) : "-";

    const tanamanIcon = tanaman === "JAGUNG" ? jagungIcon : padiIcon;
    const tanamanLabel = tanaman === "JAGUNG" ? "Tanaman Jagung" : "Tanaman Padi";
    const varietasOptions = tanaman === "JAGUNG" ? VARIETAS_JAGUNG : VARIETAS_PADI;

    const [tanggalMulai, setTanggalMulai] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [varietas, setVarietas] = useState<VarietasPupuk | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const idLahan = params.idLahan
        ? String(params.idLahan)
        : "";

    function handleRekomendasi() {
        if (!tanggalMulai) {
            setErrorMessage("Tanggal mulai pemupukan wajib diisi");
            return;
        }
        if (!varietas) {
            setErrorMessage("Pilih varietas terlebih dahulu");
            return;
        }

        setErrorMessage("");

        // Konversi varietas pupuk (TUNGGAL/MAJEMUK_...) jadi jenisPupuk + rasioNPK terpisah
        const jenisPupuk = varietas === "TUNGGAL" ? "tunggal" : "majemuk";
        const rasioNPK =
            varietas === "MAJEMUK_15_15_15" ? "15:15:15" :
                varietas === "MAJEMUK_15_10_12" ? "15:12:10" :
                    undefined;

        setRentangSensorId(idLahan, {
            dari: Number(id),
            sampai: Number(id),
        });

        router.push({
            pathname: "/(features)/(rekomendasi)",
            params: {
                sensorId: id,
                varietas: tanaman === "JAGUNG" ? "jagung" : "padi",
                luasLahan,
                targetHasilPanen: targetPanen,
                jenisPupuk,
                rasioNPK: rasioNPK ?? "",
                tanggalMulai: tanggalMulai.toISOString(),
            },
        } as any);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <ScreenHeader title="Data Pemupukan" />

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingBottom: scale(40),
                    alignItems: "center",
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Card Info Lahan */}
                <View
                    style={{
                        width: scale(355),
                        height: scale(120),
                        borderRadius: scale(16.972),
                        borderWidth: scale(0.424),
                        borderColor: "#4A5468",
                        backgroundColor: "#FFFFFF",
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: scale(25),
                        marginTop: scale(20),
                        marginBottom: scale(10),
                    }}
                >
                    <Image
                        source={tanamanIcon}
                        style={{
                            width: scale(49.372),
                            height: scale(64.666),
                            resizeMode: "contain",
                        }}
                    />

                    <View style={{ flex: 1, marginLeft: scale(12) }}>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                paddingRight: scale(8),
                            }}
                        >
                            <Text
                                style={{
                                    color: "#1A202C",
                                    fontFamily: "PoppinsSemiBold",
                                    fontSize: scale(17),
                                    flex: 1,
                                }}
                                numberOfLines={1}
                            >
                                {namaLahan}
                            </Text>
                            <Text
                                style={{
                                    color: "#000000",
                                    fontFamily: "PoppinsMedium",
                                    fontSize: scale(11),
                                    marginLeft: scale(6),
                                    marginTop: scale(4),
                                }}
                            >
                                {tanggalTanam}
                            </Text>
                        </View>

                        <View
                            style={{
                                width: scale(128.564),
                                height: scale(20),
                                borderRadius: scale(5.117),
                                marginBottom: scale(6),
                                overflow: "hidden",
                            }}
                        >
                            <LinearGradient
                                colors={["#187245", "#58C15C"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1.3, y: 0 }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#FFFFFF",
                                        fontFamily: "PoppinsMedium",
                                        fontSize: scale(12.5),
                                    }}
                                >
                                    {tanamanLabel}
                                </Text>
                            </LinearGradient>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(-3) }}>
                            <Ruler size={scale(15)} color="#1A202C" />
                            <Text
                                style={{
                                    color: "#1A202C",
                                    fontFamily: "PoppinsSemiBold",
                                    fontSize: scale(13),
                                    marginLeft: scale(6),
                                }}
                            >
                                Luas Lahan{"  "}:{"  "}
                            </Text>
                            <Text
                                style={{
                                    color: "#1A202C",
                                    fontFamily: "PoppinsMedium",
                                    fontSize: scale(13),
                                }}
                            >
                                {luasLahan} Hektar
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Target size={scale(13)} color="#000000" />
                            <Text
                                style={{
                                    color: "#000000",
                                    fontFamily: "PoppinsSemiBold",
                                    fontSize: scale(13),
                                    marginLeft: scale(6),
                                }}
                            >
                                Target Panen{"  "}:{"  "}
                            </Text>
                            <Text
                                style={{
                                    color: "#1A202C",
                                    fontFamily: "PoppinsMedium",
                                    fontSize: scale(13),
                                }}
                            >
                                {targetPanen} ton/Hektar
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Grid Kondisi Tanah */}
                <SensorCard sensorId={id} />

                {/* Tanggal Mulai Pemupukan */}
                <View style={{ width: scale(350), alignItems: "flex-start", marginTop: scale(-2), marginBottom: scale(16) }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: scale(8) }}>
                        <CalendarClock size={scale(20)} color="#000000" />
                        <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#000000" }}>
                            Tanggal Mulai Pemupukan
                        </Text>
                    </View>

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
                        }}
                    >
                        <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsRegular", fontStyle: "italic", fontSize: scale(16) }}>
                            {tanggalMulai ? formatTanggalInput(tanggalMulai) : "dd/mm/yyyy"}
                        </Text>
                        <CalendarClock size={scale(22)} color="#1E1E1E" />
                    </Pressable>

                    {showDatePicker && (
                        <DateTimePicker
                            value={tanggalMulai ?? new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setTanggalMulai(selectedDate);
                            }}
                        />
                    )}
                </View>

                {/* Pilih Varietas */}
                <View style={{ width: scale(350), alignItems: "flex-start", marginBottom: scale(25), zIndex: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: scale(8) }}>
                        <Sprout size={scale(20)} color="#000000" />
                        <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#000000" }}>
                            Pilih Varietas
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => setDropdownOpen((prev) => !prev)}
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
                        }}
                    >
                        <Text style={{ color: "#1E1E1E", fontFamily: "PoppinsMedium", fontSize: scale(16) }}>
                            {varietas ? VARIETAS_LABEL[varietas] : "Klik Untuk Memilih"}
                        </Text>
                        {dropdownOpen ? (
                            <ChevronUp size={scale(20)} color="#1E1E1E" />
                        ) : (
                            <ChevronDown size={scale(20)} color="#1E1E1E" />
                        )}
                    </Pressable>

                    {dropdownOpen && (
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
                            {varietasOptions.map((opt) => (
                                <Pressable
                                    key={opt}
                                    onPress={() => {
                                        setVarietas(opt);
                                        setDropdownOpen(false);
                                    }}
                                    style={{
                                        paddingVertical: scale(14),
                                        paddingHorizontal: scale(14),
                                        backgroundColor: varietas === opt ? "#E9FBE0" : "#FFFFFF",
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

                {/* Lokasi Sawah (Diambil dari Sensor) */}
                <View style={{ width: scale(350), marginBottom: scale(24), alignSelf: "center" }}>
                    <View
                        style={{
                            width: "100%",
                            borderRadius: scale(6.05),
                            borderWidth: scale(0.403),
                            borderColor: "#006134",
                            backgroundColor: "#FFFFFF",
                            overflow: "hidden",
                        }}
                    >
                        <LinearGradient
                            colors={["#105C2E", "#8C6A09"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1.6, y: 1 }}
                            style={{
                                width: "100%",
                                height: scale(47),
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: scale(8),
                            }}
                        >
                            <MapPin size={scale(20)} color="#FFFFFF" />
                            <Text
                                style={{
                                    color: "#FFFFFF",
                                    textAlign: "center",
                                    fontFamily: "PoppinsBold",
                                    fontSize: scale(18),
                                }}
                            >
                                Lokasi Sawah
                            </Text>
                        </LinearGradient>

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: scale(8),
                                paddingHorizontal: scale(15),
                                paddingVertical: scale(10),
                            }}
                        >
                            <MapPin size={scale(30)} color="#006134" />
                            <View style={{ flex: 1 }}>
                                {hasLocation ? (
                                    <>
                                        <Text
                                            style={{
                                                color: "#1A202C",
                                                fontFamily: "PoppinsSemiBold",
                                                fontSize: scale(13),
                                            }}
                                        >
                                            {sensor?.location!.latitude.toFixed(6)}, {sensor?.location!.longitude.toFixed(6)}
                                        </Text>
                                        <Text
                                            style={{
                                                color: "#4A5468",
                                                fontFamily: "PoppinsMedium",
                                                fontStyle: "italic",
                                                fontSize: scale(11.5),
                                                marginTop: scale(-2),
                                            }}
                                        >
                                            Diperbarui: {getTimeAgo(sensor?.location!.timestamp || 0)}
                                        </Text>
                                    </>
                                ) : (
                                    <Text
                                        style={{
                                            color: "#4A5468",
                                            fontFamily: "PoppinsRegular",
                                            fontStyle: "italic",
                                            fontSize: scale(13),
                                        }}
                                    >
                                        Lokasi belum tersedia dari sensor
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Menampilkan pesan error (Teks Merah) */}
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

                {/* Tombol Rekomendasi */}
                <Pressable
                    onPress={handleRekomendasi}
                    style={{ marginBottom: scale(20) }}
                >
                    <LinearGradient
                        colors={["#105C2E", "#8C6A09"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: scale(302.554),
                            height: scale(48),
                            borderRadius: scale(16),
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color: "#FFFFFF",
                                textAlign: "center",
                                fontFamily: "PoppinsBold",
                                fontSize: scale(20)
                            }}
                        >
                            Rekomendasi
                        </Text>
                    </LinearGradient>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}