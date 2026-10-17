//(feature)/(history)/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Map,
  MapPin,
  Radio,
  Ruler,
  Sprout,
  Tag,
  Target,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import SensorMetricCard from "@/components/sensor/SensorMetricCard";
import { saveHarvestData } from "@/lib/api";
import { useLahanStore } from "@/store/lahanStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useRekomendasiStore } from "@/store/rekomendasiStore";
import { useHistoryStore } from "@/store/historystore";
import { averageSensorReadings } from "@/utils/averageReadings";
import { scale } from "@/utils/scale";
import { SafeAreaView } from "react-native-safe-area-context";

const jagungIcon = require("@/styles/assets/jagung icon.png");
const padiIcon = require("@/styles/assets/padi icon.png");

const VARIETAS_OPTIONS = [
  "Tunggal (Urea, Sp36, KCl)",
  "Majemuk Phonska (15:15:15)",
  "Majemuk Phonska (15:10:12)",
];

const LokasiSawah = ({ alamat, lat, lon }: { alamat: string; lat: string; lon: string }) => (
  <SafeAreaView
    style={{
      width: "100%",
      borderRadius: scale(6),
      borderWidth: scale(0.4),
      borderColor: "#006134",
      backgroundColor: "#FFFFFF",
      overflow: "hidden",
      alignSelf: "center",
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
      <Map size={scale(20)} color="#FFFFFF" />
      <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(18) }}>
        Lokasi Sawah
      </Text>
    </LinearGradient>
    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), padding: scale(12) }}>
      <MapPin size={scale(27)} color="#006134" />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>
          {alamat}
        </Text>
        {lat && lon ? (
          <Text
            style={{
              color: "#4A5468",
              fontFamily: "PoppinsRegular",
              fontStyle: "italic",
              fontSize: scale(12),
              marginTop: scale(2),
            }}
          >
            Koordinat: {Number(lat).toFixed(3)}, {Number(lon).toFixed(3)}
          </Text>
        ) : null}
      </View>
    </View>
  </SafeAreaView>
);

export default function MonitoringLahanTersimpanPage() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();

  const lahanList = useLahanStore((s: any) => s.lahanList ?? s.lahan ?? []);
  const getLahanById = useLahanStore((s: any) => s.getLahanById);

  const idLahan = params.id ? String(params.id) : params.idLahan ? String(params.idLahan) : null;

  const dataLahanStore = idLahan
    ? (getLahanById ? (getLahanById(idLahan) || getLahanById(Number(idLahan))) : null) ||
      lahanList.find((l: any) => String(l.id) === idLahan)
    : null;

  const namaLahan = dataLahanStore?.namaLahan || (params.namaLahan ? String(params.namaLahan) : "Lahan");
  const tanaman = dataLahanStore?.tanaman || (params.tanaman ? String(params.tanaman) : "PADI");
  const luasLahan = dataLahanStore?.luasLahan ? String(dataLahanStore.luasLahan) : params.luasLahan ? String(params.luasLahan) : "0";
  const targetPanen = dataLahanStore?.targetPanen ? String(dataLahanStore.targetPanen) : params.targetPanen ? String(params.targetPanen) : "0";
  const alamat = dataLahanStore?.lokasi?.alamat || (params.alamat ? String(params.alamat) : "-");
  const lat = dataLahanStore?.lokasi?.lat ? String(dataLahanStore.lokasi.lat) : params.lat ? String(params.lat) : "";
  const lon = dataLahanStore?.lokasi?.lon ? String(dataLahanStore.lokasi.lon) : params.lon ? String(params.lon) : "";

  let tanggalTanam = "-";
  if (dataLahanStore?.tanggalTanam) {
    tanggalTanam = new Date(dataLahanStore.tanggalTanam).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } else if (params.tanggalTanam) {
    tanggalTanam = String(params.tanggalTanam);
  }

  const tanamanIcon = tanaman === "JAGUNG" ? jagungIcon : padiIcon;
  const tanamanLabel = tanaman === "JAGUNG" ? "Tanaman Jagung" : "Tanaman Padi";

  const panenTersimpan = useHistoryStore((s) =>
    idLahan ? s.panenByLahan[String(idLahan)] : undefined
  );
  const setPanen = useHistoryStore((s) => s.setPanen);
  const isPanen = Boolean(panenTersimpan);
  const [isModalPanenVisible, setIsModalPanenVisible] = useState(false);
  const [inputHasilPanen, setInputHasilPanen] = useState("");
  const [isSavingPanen, setIsSavingPanen] = useState(false);

  const recordings = useRecordingStore((s: any) => s.recordings ?? []);
  const savedRecommendation = useRekomendasiStore((s: any) =>
    idLahan ? s.rekomendasiByLahan?.[String(idLahan)] : undefined
  );
  const recordingForLahan = useMemo(() => {
    if (!idLahan) return undefined;
    return recordings.find((r: any) => String(r.id_lahan ?? r.idLahan) === String(idLahan));
  }, [recordings, idLahan]);
  const averageSensor = useMemo(() => {
    if (!recordingForLahan) return null;
    return recordingForLahan.averageSensor ?? (recordingForLahan.snapshots?.length
      ? averageSensorReadings(recordingForLahan.snapshots)
      : null);
  }, [recordingForLahan]);
  const hasilRekomendasi = savedRecommendation?.hasil;
  const metadataRekomendasi = savedRecommendation?.metadata;
  const [hasRekomendasi, setHasRekomendasi] = useState(false);
  const [showFormPupuk, setShowFormPupuk] = useState(false);

  const [datePupuk, setDatePupuk] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formattedDatePupuk, setFormattedDatePupuk] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVarietas, setSelectedVarietas] = useState("");

  useEffect(() => {
    setHasRekomendasi(Boolean(savedRecommendation?.hasil));
  }, [savedRecommendation]);

  const handleSimpanPanen = async () => {
    const hasil = Number(inputHasilPanen.replace(",", "."));

    if (!inputHasilPanen.trim() || !Number.isFinite(hasil) || hasil < 0) {
      Alert.alert("Input tidak valid", "Masukkan hasil panen yang valid.");
      return;
    }

    setIsSavingPanen(true);

    try {
      await saveHarvestData({
        id_lahan: Number(idLahan),
        hasilPanenAktual: hasil,
      } as any);

      setIsModalPanenVisible(false);
      setPanen(String(idLahan), hasil);
      setInputHasilPanen("");

      Alert.alert("Berhasil", "Data hasil panen berhasil disimpan.");
    } catch (error) {
      console.error("Gagal menyimpan hasil panen:", error);
      Alert.alert("Gagal menyimpan", "Data hasil panen belum berhasil disimpan.");
    } finally {
      setIsSavingPanen(false);
    }
  };

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

  const RenderGridKondisiTanah = () => (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(10) }}>
        <SensorMetricCard type={"N" as any} value={averageSensor?.N ?? "-"} />
        <SensorMetricCard type={"P" as any} value={averageSensor?.P ?? "-"} />
        <SensorMetricCard type={"K" as any} value={averageSensor?.K ?? "-"} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(10) }}>
        <SensorMetricCard type={"EC" as any} value={averageSensor?.EC ?? "-"} />
        <SensorMetricCard type={"pH" as any} value={averageSensor?.pH ?? "-"} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(24) }}>
        <SensorMetricCard type={"Suhu" as any} value={(averageSensor as any)?.temperature ?? "-"} />
        <SensorMetricCard type={"Kelembaban" as any} value={(averageSensor as any)?.humidity ?? "-"} />
      </View>
    </>
  );

  if (!idLahan && !dataLahanStore && !params.namaLahan) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", padding: scale(24) }}>
        <Sprout size={scale(42)} color="#34734A" />
        <Text style={{ color: "#1A202C", fontFamily: "PoppinsRegular", fontSize: scale(16), marginTop: scale(12), textAlign: "center" }}>
          Data lahan tidak ditemukan.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: scale(16) }}>
          <Text style={{ color: "#006134", fontFamily: "PoppinsSemiBold", fontSize: scale(14) }}>
            Kembali ke Riwayat
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* MODAL PANEN */}
      <Modal visible={isModalPanenVisible} transparent animationType="fade" onRequestClose={() => setIsModalPanenVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#FFFFFF", width: scale(310), borderRadius: scale(16), padding: scale(20) }}>
            <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18), color: "#1A202C", marginBottom: scale(16) }}>
              Hasil Panen
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: scale(8), paddingHorizontal: scale(12), height: scale(45), marginBottom: scale(24) }}>
              <TextInput style={{ flex: 1, fontFamily: "PoppinsRegular", fontSize: scale(13), color: "#1A202C" }} placeholder="Masukkan hasil panen..." placeholderTextColor="#94A3B8" keyboardType="decimal-pad" value={inputHasilPanen} onChangeText={setInputHasilPanen} />
              <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(13), color: "#64748B", fontStyle: "italic" }}>
                ton/Hektar
              </Text>
            </View>

            <Pressable disabled={isSavingPanen} onPress={handleSimpanPanen} style={{ opacity: isSavingPanen ? 0.6 : 1 }}>
              <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(8), paddingVertical: scale(12), alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(15) }}>
                  {isSavingPanen ? "Menyimpan..." : "Simpan"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => setIsModalPanenVisible(false)} style={{ alignItems: "center", paddingTop: scale(14) }}>
              <Text style={{ color: "#64748B", fontSize: scale(13) }}>Batal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

        {/* HEADER & INFO LAHAN */}
        <LinearGradient colors={["#1b5e20", "#4d6b13", "#767614"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ width: "100%", paddingTop: scale(50), paddingBottom: scale(24), borderBottomLeftRadius: scale(24), borderBottomRightRadius: scale(24), alignItems: "center" }}>
          <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", marginBottom: scale(20), paddingHorizontal: scale(16) }}>
            <Pressable onPress={() => router.back()} style={{ position: "absolute", left: scale(16), zIndex: 1 }}>
              <ArrowLeft color="#FFFFFF" size={scale(24)} />
            </Pressable>
            <Text style={{ color: "#FFFFFF", fontSize: scale(20), fontFamily: "PoppinsBold" }}>
              Data Lahan
            </Text>
          </View>

          {/* CARD INFO LAHAN */}
          <View style={{ width: scale(336), height: scale(120), borderRadius: scale(16), backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: scale(18), elevation: 4 }}>
            <Image source={tanamanIcon} style={{ width: scale(49.372), height: scale(64.666), resizeMode: "contain" }} />
            <View style={{ flex: 1, marginLeft: scale(12) }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingRight: scale(8) }}>
                <Text style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(17), flex: 1 }} numberOfLines={1}>
                  {namaLahan}
                </Text>
                <Text style={{ color: "#000000", fontFamily: "PoppinsMedium", fontSize: scale(11), marginLeft: scale(6), marginTop: scale(4) }}>
                  {tanggalTanam}
                </Text>
              </View>

              <View style={{ width: scale(128.564), height: scale(20), borderRadius: scale(5.117), marginBottom: scale(6), overflow: "hidden" }}>
                <LinearGradient colors={["#187245", "#58C15C"]} start={{ x: 0, y: 0 }} end={{ x: 1.3, y: 0 }} style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(12.5) }}>
                    {tanamanLabel}
                  </Text>
                </LinearGradient>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(-3) }}>
                <Ruler size={scale(15)} color="#1A202C" />
                <Text style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>
                  Luas Lahan : <Text style={{ fontFamily: "PoppinsMedium" }}>{luasLahan} Hektar</Text>
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Target size={scale(13)} color="#000000" />
                <Text style={{ color: "#000000", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>
                  Target Panen : <Text style={{ fontFamily: "PoppinsMedium" }}>{targetPanen} ton/Hektar</Text>
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>


      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: scale(40) }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: scale(20), alignItems: "center", paddingHorizontal: scale(20) }}>
          {isPanen ? (
            <View style={{ width: "100%", alignItems: "center", marginTop: scale(30) }}>
              <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(14), color: "#1A202C", marginBottom: scale(20) }}>
                Telah dipanen
              </Text>
              <Pressable onPress={() => router.replace({ pathname: "/(features)/(lahan)", params: { namaLahan } } as any)} style={{ width: scale(200) }}>
                <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(12), alignItems: "center", elevation: 3 }}>
                  <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>
                    Tanam Lagi
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <View style={{ width: "100%" }}>
              {!hasRekomendasi ? (
                !showFormPupuk ? (
                  <View style={{ alignItems: "center", marginTop: scale(30) }}>
                    <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(14), color: "#1A202C", marginBottom: scale(16), textAlign: "center" }}>
                      Anda belum melakukan rekomendasi pemupukan
                    </Text>
                    <Pressable onPress={() => setShowFormPupuk(true)} style={{ width: scale(200) }}>
                      <LinearGradient colors={["#105C2E", "#8C6A09"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(12), alignItems: "center" }}>
                        <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(15) }}>
                          Isi Data Pupuk
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ width: "100%" }}>
                    <RenderGridKondisiTanah />

                    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6), marginBottom: scale(8) }}>
                      <Radio size={scale(18)} color="#1A202C" />
                      <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(15), color: "#1A202C" }}>
                        Tanggal Mulai Pemupukan
                      </Text>
                    </View>
                    <Pressable onPress={() => setShowDatePicker(true)} style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: scale(8), paddingHorizontal: scale(12), height: scale(45), marginBottom: scale(20), backgroundColor: "#FFFFFF" }}>
                      <Text style={{ flex: 1, fontFamily: "PoppinsRegular", fontSize: scale(14), color: formattedDatePupuk ? "#1A202C" : "#94A3B8" }}>
                        {formattedDatePupuk || "dd/mm/yyyy"}
                      </Text>
                      <Calendar size={scale(20)} color="#1A202C" />
                    </Pressable>

                    {showDatePicker && (
                      <DateTimePicker value={datePupuk} mode="date" display="default" onChange={onChangeDate} />
                    )}

                    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6), marginBottom: scale(8) }}>
                      <Tag size={scale(18)} color="#1A202C" />
                      <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(15), color: "#1A202C" }}>
                        Pilih Varietas
                      </Text>
                    </View>

                    <View style={{ zIndex: 10, marginBottom: scale(24) }}>
                      <Pressable onPress={() => setIsDropdownOpen(!isDropdownOpen)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: scale(8), paddingHorizontal: scale(12), height: scale(45), backgroundColor: "#FFFFFF" }}>
                        <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(13), color: selectedVarietas ? "#1A202C" : "#94A3B8" }}>
                          {selectedVarietas || "Klik Untuk Memilih"}
                        </Text>
                        <ChevronDown size={scale(20)} color="#1A202C" />
                      </Pressable>
                      {isDropdownOpen && (
                        <View style={{ position: "absolute", top: scale(50), left: 0, right: 0, backgroundColor: "#FFFFFF", borderRadius: scale(8), borderWidth: 1, borderColor: "#CBD5E1", elevation: 5, paddingVertical: scale(4) }}>
                          {VARIETAS_OPTIONS.map((item, index) => (
                            <Pressable key={index} onPress={() => { setSelectedVarietas(item); setIsDropdownOpen(false); }} style={{ paddingVertical: scale(10), paddingHorizontal: scale(12), borderBottomWidth: index !== VARIETAS_OPTIONS.length - 1 ? 1 : 0, borderBottomColor: "#F1F5F9" }}>
                              <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(13), color: "#1A202C" }}>
                                {item}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>

                    <LokasiSawah alamat={alamat} lat={lat} lon={lon} />
                    <Pressable style={{ marginTop: scale(24), marginBottom: scale(20) }} onPress={() => {
                        if (!recordingForLahan?.localId) {
                          Alert.alert("Data rekaman belum tersedia", "Lakukan rekaman sensor untuk lahan ini terlebih dahulu.");
                          return;
                        }
                        router.push({ pathname: "/(features)/(rekomendasi)", params: { localId: String(recordingForLahan.localId), idLahan: String(idLahan) } } as any);
                      }}>
                      <LinearGradient colors={["#105C2E", "#588157"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(14), alignItems: "center" }}>
                        <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>
                          Rekomendasi
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                )
              ) : (
                <View style={{ width: "100%" }}>
                  <View style={{ alignItems: "center", marginBottom: scale(16) }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6) }}>
                      <Sprout size={scale(20)} color="#1A202C" />
                      <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18), color: "#1A202C" }}>
                        Kondisi Tanah
                      </Text>
                    </View>
                  </View>

                  <RenderGridKondisiTanah />

                  <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18), color: "#1A202C", marginBottom: scale(8) }}>
                    Pupuk
                  </Text>
                  <View style={{ backgroundColor: "#105C2E", borderRadius: scale(10), padding: scale(12), flexDirection: "row", justifyContent: "space-between", marginBottom: scale(24) }}>
                    {(metadataRekomendasi?.jenisPupuk === "majemuk"
                      ? [
                          { label: "Nitrogen", value: "Urea" },
                          { label: "Pupuk Majemuk", value: `NPK ${metadataRekomendasi?.rasioNPK ?? "15:15:15"}` },
                        ]
                      : [
                          { label: "Nitrogen", value: "Urea" },
                          { label: "Kalium", value: "KCL" },
                          { label: "Fosfat", value: "SP-36" },
                        ]
                    ).map((item: any) => (
                      <View key={item.label} style={{ flex: 1, marginHorizontal: scale(3), borderRadius: scale(6), overflow: "hidden" }}>
                        <View style={{ backgroundColor: "#4CAF50", paddingVertical: scale(6), alignItems: "center" }}>
                          <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: scale(11), textAlign: "center" }}>
                            {item.label}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: "#D4EDDA", paddingVertical: scale(8), alignItems: "center" }}>
                          <Text style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(12), textAlign: "center" }}>
                            {item.value}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(18), color: "#1A202C", marginBottom: scale(8) }}>
                    Rekomendasi
                  </Text>
                  {(hasilRekomendasi?.jadwal ?? []).map((fase: any, index: number) => {
                    const items = [
                      { label: "Urea", value: fase.urea },
                      ...(fase.sp36 !== undefined ? [{ label: "SP-36", value: fase.sp36 }] : []),
                      ...(fase.kcl !== undefined ? [{ label: "KCL", value: fase.kcl }] : []),
                      ...(fase.npk !== undefined ? [{ label: `NPK ${metadataRekomendasi?.rasioNPK ?? "15:15:15"}`, value: fase.npk }] : []),
                    ];
                    return (
                      <View key={`${fase.fase ?? "fase"}-${index}`} style={{ backgroundColor: "#B7E4B9", borderRadius: scale(12), padding: scale(12), marginBottom: scale(12) }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(10) }}>
                          <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(13), color: "#1A202C" }}>
                            Pemupukan ke-{index + 1}
                          </Text>
                          <Text style={{ fontFamily: "PoppinsMedium", fontSize: scale(12), color: "#1A202C" }}>
                            {fase.fase ?? "-"}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                          {items.map((item: any) => (
                            <View key={item.label} style={{ width: items.length === 2 ? "48%" : "31%", marginBottom: scale(6), borderRadius: scale(6), overflow: "hidden" }}>
                              <View style={{ backgroundColor: "#58C15C", paddingVertical: scale(4), alignItems: "center" }}>
                                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: scale(12) }}>
                                  {item.label}
                                </Text>
                              </View>
                              <View style={{ backgroundColor: "#105C2E", paddingVertical: scale(8), alignItems: "center" }}>
                                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>
                                  {item.value ?? 0} kg
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}

                  

                  <LokasiSawah alamat={alamat} lat={lat} lon={lon} />

                  <Pressable style={{ marginTop: scale(20), marginBottom: scale(20) }} onPress={() => setIsModalPanenVisible(true)}>
                    <LinearGradient colors={["#105C2E", "#588157"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(12), paddingVertical: scale(14), alignItems: "center" }}>
                      <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>
                        Panen Sekarang!
                      </Text>
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