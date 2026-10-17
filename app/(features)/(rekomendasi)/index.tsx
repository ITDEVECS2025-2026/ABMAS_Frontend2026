
//(rekomendasi)/index.tsx
import React, { useMemo, useRef, useEffect } from "react";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Ruler,
  Target,
  MapPin,
  Map,
  Sprout,
  FlaskConical,
  Droplets,
  Thermometer,
  Leaf,
  Zap,
} from "lucide-react-native";

import { COLORS } from "@/constants";
import { scale } from "@/utils/scale";

import { useSensorStore } from "@/store/sensorContext";
import { useRekomendasiStore } from "@/store/rekomendasiStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useLahanStore } from "@/store/lahanStore";

import { averageSensorReadings } from "@/utils/averageReadings";
import { getRekomendasi } from "@/utils/ruleEngine";

import type {
  Varietas,
  JenisPupuk,
  RasioNPK,
  JadwalFaseTunggal,
  JadwalFaseMajemukPadi,
  JadwalFaseMajemukJagung,
} from "@/utils/ruleEngine";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

export default function RekomendasiScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const localId = Array.isArray(params.localId)
    ? params.localId[0]
    : params.localId;

  const idLahanParam = Array.isArray(params.idLahan)
    ? params.idLahan[0]
    : params.idLahan;

  const scrollX = useRef(new Animated.Value(0)).current;

  // =====================================================
  // 1. AMBIL SESI REKAMAN DARI ZUSTAND
  // =====================================================
  const recording = useRecordingStore((state) =>
    state.recordings.find((r) => r.localId === localId)
  );

  const payload = recording;

  // =====================================================
  // 2. HITUNG RATA-RATA DARI DATA YANG DIREKAM
  // =====================================================
  const averageSensor =
    (payload as any)?.averageSensor ||
    (recording?.snapshots
      ? averageSensorReadings(recording.snapshots)
      : null);

  // =====================================================
  // 3. DATA LAHAN UNTUK INFORMASI DAN LOKASI
  // =====================================================
  const getLahanById = useLahanStore(
    (state) => state.getLahanById
  );

  const idLahan = idLahanParam
    ? String(idLahanParam)
    : payload?.id_lahan != null
      ? String(payload.id_lahan)
      : null;

  const dataLahan = idLahan
    ? getLahanById(idLahan)
    : undefined;

  // =====================================================
  // 4. PARSING DATA UNTUK RULE ENGINE
  // Logic rekomendasi dipertahankan
  // =====================================================
  const luasLahan = Number(payload?.luasLahan) || 0;
  const targetHasilPanen = Number(payload?.targetPanen) || 0;

  const varietas: Varietas =
    payload?.tanaman?.toLowerCase() === "jagung"
      ? "jagung"
      : "padi";

  const pupukStr = payload?.pupuk || "";
  const isMajemuk = pupukStr.toLowerCase().includes("majemuk");

  const jenisPupuk: JenisPupuk = isMajemuk
    ? "majemuk"
    : "tunggal";

  let rasioNPK: RasioNPK | undefined = undefined;

  if (isMajemuk) {
    if (pupukStr.includes("15:15:15")) {
      rasioNPK = "15:15:15";
    } else if (
      pupukStr.includes("15:10:12") ||
      pupukStr.includes("15:12:10")
    ) {
      rasioNPK = "15:12:10";
    }
  }

  // =====================================================
  // 5. SENSOR DAN STORE REKOMENDASI
  // =====================================================
  const { getSensorById } = useSensorStore();

  const sensor = payload?.device_id
    ? getSensorById(String(payload.device_id))
    : null;

  const setRekomendasi = useRekomendasiStore(
    (state) => state.setRekomendasi
  );

  // =====================================================
  // 6. JALANKAN RULE ENGINE
  // =====================================================
  const hasil = useMemo(() => {
    if (!averageSensor) return null;

    return getRekomendasi(
      {
        n: averageSensor.N,
        p: averageSensor.P,
        k: averageSensor.K,
        ec: averageSensor.EC,
        ph: averageSensor.pH,
      },
      {
        tanamanDipilih: varietas,
        luasLahan,
        targetHasilPanen,
        jenisPupukDipilih: jenisPupuk,
        rasioNPKDipilih: rasioNPK,
      }
    );
  }, [
    averageSensor,
    varietas,
    jenisPupuk,
    rasioNPK,
    luasLahan,
    targetHasilPanen,
  ]);

  useEffect(() => {
    if (hasil && payload?.device_id) {
      setRekomendasi(String(payload.device_id), hasil, {
        idLahan: idLahan ? String(idLahan) : undefined,
        localId: payload.localId,
        deviceId: String(payload.device_id),
        namaLahan: dataLahan?.namaLahan || payload.namaLahan || "Lahan",
        tanaman: varietas,
        jenisPupuk,
        rasioNPK,
        luasLahan,
        targetPanen: targetHasilPanen,
        tanggalTanam: payload.tanggalTanam,
        averageSensor,
        savedAt: new Date().toISOString(),
      });
    }
  }, [
    hasil,
    payload?.device_id,
    payload?.localId,
    idLahan,
    dataLahan?.namaLahan,
    payload?.namaLahan,
    varietas,
    jenisPupuk,
    rasioNPK,
    luasLahan,
    targetHasilPanen,
    payload?.tanggalTanam,
    averageSensor,
    setRekomendasi,
  ]);

  // =====================================================
  // 7. VALIDASI DATA
  // =====================================================
  if (!payload || !averageSensor || !hasil) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeaderFallback
          title="Rekomendasi"
          onBack={() => router.replace("/(main)/history")}
        />
        <Text style={styles.emptyText}>
          Data rekaman tidak ditemukan atau belum diproses.
        </Text>
      </SafeAreaView>
    );
  }

  // =====================================================
  // 8. DATA TAMPILAN
  // =====================================================
  const judulVarietas =
    varietas === "padi" ? "Padi" : "Jagung";

  const judulJenis = isMajemuk ? "Majemuk" : "Tunggal";

  const headerTitle =
    sensor?.name || `Sensor ${payload.device_id}`;

  const displayRasioNPK =
    rasioNPK === "15:12:10"
      ? "15:10:12"
      : rasioNPK ?? "15:15:15";

  const formattedDate = payload.tanggalTanam
    ? new Date(payload.tanggalTanam).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
    : "-";

  const tanamanIcon =
    varietas === "jagung" ? jagungIcon : padiIcon;

  const namaLahan =
    dataLahan?.namaLahan || payload.namaLahan || "Lahan";

  const luasLahanText =
    dataLahan?.luasLahan != null
      ? String(dataLahan.luasLahan)
      : String(payload.luasLahan ?? "-");

  const targetPanenText =
    dataLahan?.targetPanen != null
      ? String(dataLahan.targetPanen)
      : String(payload.targetPanen ?? "-");

  const alamat =
    dataLahan?.lokasi?.alamat || "Lokasi belum tersedia";

  const latitude = dataLahan?.lokasi?.lat;
  const longitude = dataLahan?.lokasi?.lon;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {/* HEADER & INFO LAHAN */}
        <LinearGradient colors={["#1b5e20", "#4d6b13", "#767614"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ width: "100%", paddingTop: scale(50), paddingBottom: scale(24), borderBottomLeftRadius: scale(24), borderBottomRightRadius: scale(24), alignItems: "center" }}>
          <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "center", marginBottom: scale(20), paddingHorizontal: scale(16) }}>
            <Pressable onPress={() => router.replace("/(main)/history")} style={{ position: "absolute", left: scale(16), zIndex: 1 }}>
              <ArrowLeft color="#FFFFFF" size={scale(24)} />
            </Pressable>
            <Text style={{ color: "#FFFFFF", fontSize: scale(20), fontFamily: "PoppinsBold" }}>
              Rekomendasi
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
                  {formattedDate}
                </Text>
              </View>

              <View style={{ width: scale(128.564), height: scale(20), borderRadius: scale(5.117), marginBottom: scale(6), overflow: "hidden" }}>
                <LinearGradient colors={["#187245", "#58C15C"]} start={{ x: 0, y: 0 }} end={{ x: 1.3, y: 0 }} style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(12.5) }}>
                    Tanaman {judulVarietas}
                  </Text>
                </LinearGradient>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(-3) }}>
                <Ruler size={scale(15)} color="#1A202C" />
                <Text style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>
                  Luas Lahan : <Text style={{ fontFamily: "PoppinsMedium" }}>{luasLahanText} Hektar</Text>
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Target size={scale(13)} color="#000000" />
                <Text style={{ color: "#000000", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>
                  Target Panen : <Text style={{ fontFamily: "PoppinsMedium" }}>{targetPanenText} ton/Hektar</Text>
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: scale(40) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: scale(20), alignItems: "center", paddingHorizontal: scale(20) }}>
          <View style={{ width: "100%" }}>
        {/* ================================================= */}
        {/* KONDISI TANAH                                     */}
        {/* ================================================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Sprout size={17} color="#252525" />

            <Text style={styles.sectionTitle}>
              Kondisi Tanah
            </Text>

            <Ionicons
              name="information-circle-outline"
              size={18}
              color={COLORS.textMuted}
            />
          </View>

          <Text style={styles.sectionSub}>
            Pembaruan terakhir: Data rekaman
          </Text>

          {/* N, P, K */}
          <View style={styles.soilGrid}>
            {[
              {
                label: "N",
                value: `${averageSensor.N} mg/kg`,
                icon: <Leaf size={16} color="#FFFFFF" />,
              },
              {
                label: "P",
                value: `${averageSensor.P} mg/kg`,
                icon: <Leaf size={16} color="#FFFFFF" />,
              },
              {
                label: "K",
                value: `${averageSensor.K} mg/kg`,
                icon: <Leaf size={16} color="#FFFFFF" />,
              },
            ].map((item) => (
              <View key={item.label} style={styles.soilCard}>
                <View style={styles.soilCardHeader}>
                  <View style={styles.soilLabelRow}>
                    {item.icon}
                    <Text style={styles.soilCardLabel}>
                      {item.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.soilCardBody}>
                  <Text style={styles.soilCardValue}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* EC dan pH */}
          <View style={styles.soilGrid}>
            <View style={styles.soilCard}>
              <View style={styles.soilCardHeader}>
                <View style={styles.soilLabelRow}>
                  <Zap size={16} color="#FFFFFF" />
                  <Text style={styles.soilCardLabel}>EC</Text>
                </View>
              </View>

              <View style={styles.soilCardBody}>
                <Text style={styles.soilCardValue}>
                  {averageSensor.EC} mS/cm
                </Text>
              </View>
            </View>

            <View style={styles.soilCard}>
              <View style={styles.soilCardHeader}>
                <View style={styles.soilLabelRow}>
                  <FlaskConical size={16} color="#FFFFFF" />
                  <Text style={styles.soilCardLabel}>pH</Text>
                </View>
              </View>

              <View style={styles.soilCardBody}>
                <Text style={styles.soilCardValue}>
                  {averageSensor.pH}
                </Text>
              </View>
            </View>
          </View>

          {/* Suhu dan kelembapan */}
          <View style={styles.soilGrid}>
            <View style={styles.soilCard}>
              <View style={styles.soilCardHeader}>
                <View style={styles.soilLabelRow}>
                  <Thermometer size={16} color="#FFFFFF" />
                  <Text style={styles.soilCardLabel}>
                    Suhu
                  </Text>
                </View>
              </View>

              <View style={styles.soilCardBody}>
                <Text style={styles.soilCardValue}>
                  {(averageSensor as any).temperature ?? "-"} °C
                </Text>
              </View>
            </View>

            <View style={styles.soilCard}>
              <View style={styles.soilCardHeader}>
                <View style={styles.soilLabelRow}>
                  <Droplets size={16} color="#FFFFFF" />
                  <Text style={styles.soilCardLabel}>
                    Kelembapan
                  </Text>
                </View>
              </View>

              <View style={styles.soilCardBody}>
                <Text style={styles.soilCardValue}>
                  {(averageSensor as any).humidity ?? "-"}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* RINGKASAN JENIS PUPUK                             */}
        {/* ================================================= */}
        <View style={styles.pupukContainer}>
          <View style={styles.pupukGrid}>
            {!isMajemuk ? (
              <>
                <PupukPair
                  label="Nitrogen"
                  value="Urea"
                />
                <PupukPair
                  label="Kalium"
                  value="KCL"
                />
                <PupukPair
                  label="Fosfat"
                  value="SP-36"
                />
              </>
            ) : (
              <>
                <PupukPair
                  label="Nitrogen"
                  value="Urea"
                />
                <PupukPair
                  label="Pupuk Majemuk"
                  value={`NPK ${displayRasioNPK}`}
                />
              </>
            )}
          </View>
        </View>

        {/* ================================================= */}
        {/* REKOMENDASI PEMUPUKAN                             */}
        {/* ================================================= */}
        <View style={styles.section}>
          <Text style={styles.mainSectionTitle}>
            Rekomendasi
          </Text>

          {hasil.jadwal.map((fase, idx) => (
            <View key={idx} style={styles.rekomendasiCard}>
              <View style={styles.rekomendasiHeaderRow}>
                <Text style={styles.rekomendasiLabel}>
                  Pemupukan ke-{idx + 1}
                </Text>

                <Text style={styles.rekomendasiHst}>
                  {fase.fase}
                </Text>
              </View>

              {renderFaseItems(
                fase,
                isMajemuk,
                varietas,
                displayRasioNPK
              )}
            </View>
          ))}
        </View>

        {/* ================================================= */}
        {/* LOKASI SAWAH                                      */}
        {/* ================================================= */}
        <View style={styles.locationCard}>
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.locationHeader}
          >
            <Map size={24} color="#FFFFFF" />

            <Text style={styles.locationHeaderText}>
              Lokasi Sawah
            </Text>
          </LinearGradient>

          <View style={styles.locationBody}>
            <MapPin size={28} color="#1A202C" />

            <View style={{ flex: 1 }}>
              <Text style={styles.locationAddress}>
                {alamat}
              </Text>

              {latitude != null &&
                longitude != null && (
                  <Text style={styles.locationCoordinates}>
                    Koordinat: {latitude}, {longitude}
                  </Text>
                )}
            </View>
          </View>
        </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// =======================================================
// HEADER FALLBACK
// =======================================================
function ScreenHeaderFallback({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.fallbackHeader}>
      <Pressable onPress={onBack} hitSlop={10}>
        <ArrowLeft size={26} color="#FFFFFF" />
      </Pressable>

      <Text style={styles.fallbackHeaderTitle}>
        {title}
      </Text>

      <View style={{ width: 26 }} />
    </View>
  );
}

// =======================================================
// KOMPONEN PENDUKUNG
// =======================================================
function PupukPair({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.pupukPairPill}>
      <View style={styles.pupukPairLabelBox}>
        <Text style={styles.pupukPairLabel}>
          {label}
        </Text>
      </View>

      <View style={styles.pupukPairValueBox}>
        <Text style={styles.pupukPairValueText}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function renderFaseItems(
  fase:
    | JadwalFaseTunggal
    | JadwalFaseMajemukPadi
    | JadwalFaseMajemukJagung,
  isMajemuk: boolean,
  varietas: Varietas,
  displayRasioNPK: string
) {
  if (varietas === "jagung" && isMajemuk) {
    const f = fase as JadwalFaseMajemukJagung;

    return (
      <>
        <View style={styles.rekomendasiTopRow}>
          <PupukFaseItem
            label="Urea"
            value={`${f.urea} kg`}
          />
        </View>

        <View style={styles.rekomendasiBottomRow}>
          <PupukFaseItemFull
            label={`NPK ${displayRasioNPK}`}
            value={`${f.npk} kg`}
          />
        </View>
      </>
    );
  }

  const f = fase as JadwalFaseTunggal &
    Partial<JadwalFaseMajemukPadi>;

  return (
    <>
      <View style={styles.rekomendasiTopRow}>
        <PupukFaseItem
          label="Urea"
          value={`${f.urea} kg`}
        />

        {f.sp36 !== undefined && (
          <PupukFaseItem
            label="SP-36"
            value={`${f.sp36} kg`}
          />
        )}

        {f.kcl !== undefined && (
          <PupukFaseItem
            label="KCL"
            value={`${f.kcl} kg`}
          />
        )}
      </View>

      {isMajemuk && f.npk !== undefined && (
        <View style={styles.rekomendasiBottomRow}>
          <PupukFaseItemFull
            label={`NPK ${displayRasioNPK}`}
            value={`${f.npk} kg`}
          />
        </View>
      )}
    </>
  );
}

function PupukFaseItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.pupukFaseItem}>
      <View style={styles.pupukFaseLabel}>
        <Text style={styles.pupukFaseLabelText}>
          {label}
        </Text>
      </View>

      <View style={styles.pupukFaseValue}>
        <Text style={styles.pupukFaseValueText}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function PupukFaseItemFull({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.pupukFaseItemFull}>
      <View style={styles.pupukFaseLabel}>
        <Text style={styles.pupukFaseLabelText}>
          {label}
        </Text>
      </View>

      <View style={styles.pupukFaseValue}>
        <Text style={styles.pupukFaseValueText}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function parseWarningItem(
  pesan: string
): { title: string; desc: string } {
  const parts = pesan.split("=>");

  return parts.length === 2
    ? {
      title: parts[0].trim(),
      desc: parts[1].trim(),
    }
    : {
      title: pesan.trim(),
      desc: "",
    };
}

// =======================================================
// STYLES
// =======================================================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  hero: {
    paddingTop: 4,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  headerRow: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  backButton: {
    position: "absolute",
    left: 0,
    padding: 3,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(23),
  },

  landCard: {
    width: "100%",
    minHeight: scale(120),
    borderRadius: scale(16.972),
    borderWidth: scale(0.424),
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(12),
  },

  cropImage: {
    width: scale(49.372),
    height: scale(64.666),
    resizeMode: "contain",
  },

  landInfo: {
    flex: 1,
    marginLeft: scale(10),
  },

  landTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },

  landName: {
    color: "#1A202C",
    fontFamily: "PoppinsSemiBold",
    fontSize: scale(15),
    flex: 1,
  },

  plantDate: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(9),
    marginLeft: 5,
    marginTop: 3,
  },

  cropBadge: {
    width: scale(128.564),
    height: scale(20),
    borderRadius: scale(5.117),
    marginBottom: scale(5),
    overflow: "hidden",
  },

  cropBadgeGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  cropBadgeText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsMedium",
    fontSize: scale(11),
  },

  landDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 1,
  },

  landDetailLabel: {
    color: "#1A202C",
    fontFamily: "PoppinsSemiBold",
    fontSize: scale(11),
    marginLeft: scale(4),
  },

  landDetailValue: {
    color: "#1A202C",
    fontFamily: "PoppinsMedium",
    fontSize: scale(11),
    flexShrink: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingBottom: scale(40),
    alignItems: "center",
  },

  section: {
    width: "100%",
    marginBottom: 20,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  sectionTitle: {
    color: "#252525",
    fontFamily: "PoppinsBold",
    fontSize: scale(16),
  },

  sectionSub: {
    color: "#333333",
    fontFamily: "PoppinsMedium",
    fontSize: scale(9),
    textAlign: "center",
    marginTop: -2,
    marginBottom: 16,
  },

  soilGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  soilCard: {
    flex: 1,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#9FDF9F",
    elevation: 3,
  },

  soilCardHeader: {
    backgroundColor: "#2C8A43",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  soilLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  soilCardLabel: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(14),
  },

  soilCardBody: {
    backgroundColor: "#9FDF9F",
    minHeight: 44,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  soilCardValue: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(16),
    textAlign: "center",
  },

  pupukContainer: {
    width: "100%",
    backgroundColor: "#006134",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  pupukGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 8,
  },

  pupukPairPill: {
    flex: 1,
    flexDirection: "column",
    borderRadius: 10,
    overflow: "hidden",
  },

  pupukPairLabelBox: {
    backgroundColor: "#238B43",
    paddingVertical: 7,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  pupukPairLabel: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(15),
    textAlign: "center",
  },

  pupukPairValueBox: {
    backgroundColor: "#B2E7A9",
    paddingVertical: 7,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  pupukPairValueText: {
    color: "#000000",
    fontFamily: "PoppinsBold",
    fontSize: scale(17),
    textAlign: "center",
  },

  mainSectionTitle: {
    color: "#000000",
    fontFamily: "PoppinsBold",
    fontSize: scale(17),
    marginBottom: 8,
  },

  rekomendasiCard: {
    backgroundColor: "#B2E7A9",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
    padding: 12,
  },

  rekomendasiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  rekomendasiLabel: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(16),
  },

  rekomendasiHst: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(16),
  },

  rekomendasiTopRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  rekomendasiBottomRow: {
    gap: 8,
  },

  pupukFaseItem: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },

  pupukFaseItemFull: {
    borderRadius: 10,
    overflow: "hidden",
  },

  pupukFaseLabel: {
    backgroundColor: "#51A927",
    paddingVertical: 5,
    alignItems: "center",
  },

  pupukFaseLabelText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(13),
  },

  pupukFaseValue: {
    backgroundColor: "#105C2E",
    minHeight: 46,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  pupukFaseValueText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(13),
  },

  peringatanScrollView: {
    width: "100%",
  },

  peringatanBox: {
    backgroundColor: "#105C2E",
    borderRadius: 12,
    padding: 24,
    marginRight: 16,
    width: CARD_WIDTH - 16,
    minHeight: 120,
    justifyContent: "center",
  },

  peringatanTitle: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(14),
    marginBottom: 8,
  },

  peringatanDesc: {
    color: "#FFFFFF",
    fontFamily: "PoppinsMedium",
    fontSize: scale(12),
    lineHeight: scale(19),
    textAlign: "justify",
  },

  locationCard: {
    width: "100%",
    marginTop: 2,
    marginBottom: 22,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#B8D3C0",
    elevation: 3,
    backgroundColor: "#FFFFFF",
  },

  locationHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  locationHeaderText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(16),
  },

  locationBody: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
  },

  locationAddress: {
    color: "#1A202C",
    fontFamily: "PoppinsMedium",
    fontSize: scale(11),
  },

  locationCoordinates: {
    color: "#64748B",
    fontFamily: "PoppinsRegular",
    fontSize: scale(9),
    marginTop: 3,
  },

  harvestButtonWrapper: {
    width: "88%",
    minHeight: 52,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 28,
  },

  harvestButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  harvestButtonText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(19),
  },

  fallbackHeader: {
    backgroundColor: "#105C2E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  fallbackHeaderTitle: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: 18,
  },

  emptyText: {
    color: COLORS.text,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 24,
  },
});
