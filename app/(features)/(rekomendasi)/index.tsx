//(rekomendasi)/index.tsx
import React, { useMemo, useRef, useEffect } from "react";
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

export default function RekomendasiScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const localId = Array.isArray(params.localId)
    ? params.localId[0]
    : params.localId;

  const idLahanParam = Array.isArray(params.idLahan)
    ? params.idLahan[0]
    : params.idLahan;
  const from = Array.isArray(params.from) ? params.from[0] : params.from;
  const dariHistory = from === "history";

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
  const getLahanById = useLahanStore((state) => state.getLahanById);

  const idLahan = idLahanParam
    ? String(idLahanParam)
    : payload?.id_lahan != null
    ? String(payload.id_lahan)
    : null;

  const dataLahan = idLahan ? getLahanById(idLahan) : undefined;

  // =====================================================
  // 4. PARSING DATA UNTUK RULE ENGINE
  // =====================================================
  const luasLahan = Number(payload?.luasLahan) || 0;
  const targetHasilPanen = Number(payload?.targetPanen) || 0;

  const varietas: Varietas =
    payload?.tanaman?.toLowerCase() === "jagung" ? "jagung" : "padi";

  const pupukStr = payload?.pupuk || "";
  const isMajemuk = pupukStr.toLowerCase().includes("majemuk");

  const jenisPupuk: JenisPupuk = isMajemuk ? "majemuk" : "tunggal";

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
      <View style={styles.safe}>
        <ScreenHeaderFallback
          title="Data Lahan"
          onBack={() => router.replace("/(main)/history")}
        />
        <Text style={styles.emptyText}>
          Data rekaman tidak ditemukan atau belum diproses.
        </Text>
      </View>
    );
  }

  // =====================================================
  // 8. DATA TAMPILAN
  // =====================================================
  const judulVarietas = varietas === "padi" ? "Padi" : "Jagung";

  const displayRasioNPK =
    rasioNPK === "15:12:10"
      ? "15:10:12"
      : rasioNPK ?? "15:15:15";

  const formattedDate = payload.tanggalTanam
    ? new Date(payload.tanggalTanam).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  const tanamanIcon = varietas === "jagung" ? jagungIcon : padiIcon;

  const namaLahan =
    dataLahan?.namaLahan || payload.namaLahan || "Lahan Pak Mateno";

  const luasLahanText =
    dataLahan?.luasLahan != null
      ? String(dataLahan.luasLahan)
      : String(payload.luasLahan ?? "-");

  const targetPanenText =
    dataLahan?.targetPanen != null
      ? String(dataLahan.targetPanen)
      : String(payload.targetPanen ?? "-");

  const alamat = dataLahan?.lokasi?.alamat || "Surabaya, Sukolilo, Jawa Timur";

  const latitude = dataLahan?.lokasi?.lat;
  const longitude = dataLahan?.lokasi?.lon;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* HEADER & INFO LAHAN */}
      <LinearGradient
        colors={["#1b5e20", "#4d6b13", "#767614"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTitleRow}>
          <Pressable
            onPress={() => router.replace("/(main)/history")}
            style={styles.backButton}
          >
            <ArrowLeft color="#FFFFFF" size={scale(24)} />
          </Pressable>
          <Text style={styles.headerTitleText}>Data Lahan</Text>
        </View>

        {/* CARD INFO LAHAN */}
        <View style={styles.landCard}>
          <Image source={tanamanIcon} style={styles.cropImage} />
          <View style={styles.landInfoContainer}>
            <View style={styles.landTitleRow}>
              <Text style={styles.landName} numberOfLines={1}>
                {namaLahan}
              </Text>
              <Text style={styles.plantDate}>{formattedDate}</Text>
            </View>

            <View style={styles.cropBadge}>
              <LinearGradient
                colors={["#187245", "#58C15C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.3, y: 0 }}
                style={styles.cropBadgeGradient}
              >
                <Text style={styles.cropBadgeText}>
                  Tanaman {judulVarietas}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.landDetailRow}>
              <Ruler size={scale(14)} color="#1A202C" />
              <Text style={styles.landDetailLabel}>
                Luas Lahan : <Text style={styles.landDetailValue}>{luasLahanText} Hektar</Text>
              </Text>
            </View>

            <View style={styles.landDetailRow}>
              <Target size={scale(13)} color="#000000" />
              <Text style={styles.landDetailLabel}>
                Target Panen : <Text style={styles.landDetailValue}>{targetPanenText} ton/Hektar</Text>
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
        <View style={styles.bodyWrapper}>
          <View style={{ width: "100%" }}>
            
            {/* ================================================= */}
            {/* KONDISI TANAH                                     */}
            {/* ================================================= */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Sprout size={17} color="#252525" />
                <Text style={styles.sectionTitle}>Kondisi Tanah</Text>
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
                  { label: "N", value: `${averageSensor.N}` },
                  { label: "P", value: `${averageSensor.P}` },
                  { label: "K", value: `${averageSensor.K}` },
                ].map((item) => (
                  <View key={item.label} style={styles.soilCard}>
                    <View style={styles.soilCardHeader}>
                      <View style={styles.soilLabelRow}>
                        <Leaf size={14} color="#FFFFFF" />
                        <Text style={styles.soilCardLabel}>{item.label}</Text>
                      </View>
                    </View>
                    <View style={styles.soilCardBody}>
                      <Text style={styles.soilCardValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* EC dan pH */}
              <View style={styles.soilGrid}>
                <View style={styles.soilCard}>
                  <View style={styles.soilCardHeader}>
                    <View style={styles.soilLabelRow}>
                      <Zap size={14} color="#FFFFFF" />
                      <Text style={styles.soilCardLabel}>EC</Text>
                    </View>
                  </View>
                  <View style={styles.soilCardBody}>
                    <Text style={styles.soilCardValue}>{averageSensor.EC}</Text>
                  </View>
                </View>

                <View style={styles.soilCard}>
                  <View style={styles.soilCardHeader}>
                    <View style={styles.soilLabelRow}>
                      <FlaskConical size={14} color="#FFFFFF" />
                      <Text style={styles.soilCardLabel}>pH</Text>
                    </View>
                  </View>
                  <View style={styles.soilCardBody}>
                    <Text style={styles.soilCardValue}>{averageSensor.pH}</Text>
                  </View>
                </View>
              </View>

              {/* Suhu dan kelembapan */}
              <View style={styles.soilGrid}>
                <View style={styles.soilCard}>
                  <View style={styles.soilCardHeader}>
                    <View style={styles.soilLabelRow}>
                      <Thermometer size={14} color="#FFFFFF" />
                      <Text style={styles.soilCardLabel}>Suhu</Text>
                    </View>
                  </View>
                  <View style={styles.soilCardBody}>
                    <Text style={styles.soilCardValue}>
                      {(averageSensor as any).temperature ?? "100"}
                    </Text>
                  </View>
                </View>

                <View style={styles.soilCard}>
                  <View style={styles.soilCardHeader}>
                    <View style={styles.soilLabelRow}>
                      <Droplets size={14} color="#FFFFFF" />
                      <Text style={styles.soilCardLabel}>Kelembapan</Text>
                    </View>
                  </View>
                  <View style={styles.soilCardBody}>
                    <Text style={styles.soilCardValue}>
                      {(averageSensor as any).humidity ?? "100"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ================================================= */}
            {/* RINGKASAN JENIS PUPUK (GRID 2x2 SESUAI UI)        */}
            {/* ================================================= */}
            <View style={styles.section}>
              <Text style={styles.mainSectionTitle}>Pupuk</Text>
              <View style={styles.pupukContainer}>
                {!isMajemuk ? (
                  <View style={styles.pupukGrid2x2}>
                    <View style={styles.pupukRow}>
                      <PupukPair label="Nitrogen" value="Urea" />
                      <PupukPair label="Kalium" value="KCL" />
                    </View>
                    <View style={styles.pupukRow}>
                      <PupukPair label="Fosfat" value="SP-36" />
                      <View style={{ flex: 1 }} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.pupukGrid2x2}>
                    <View style={styles.pupukRow}>
                      <PupukPair label="Nitrogen" value="Urea" />
                      <PupukPair label="Kalium" value="KCL" />
                    </View>
                    <View style={styles.pupukRow}>
                      <PupukPair label="Fosfat" value="SP-36" />
                      <PupukPair label="Pupuk Majemuk" value={`NPK ${displayRasioNPK}`} />
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* ================================================= */}
            {/* REKOMENDASI PEMUPUKAN                             */}
            {/* ================================================= */}
            <View style={styles.section}>
              <Text style={styles.mainSectionTitle}>Rekomendasi</Text>

              {hasil.jadwal.map((fase, idx) => (
                <View key={idx} style={styles.rekomendasiCard}>
                  <View style={styles.rekomendasiHeaderRow}>
                    <Text style={styles.rekomendasiLabel}>
                      Pemupukan ke-{idx + 1}
                    </Text>
                    <Text style={styles.rekomendasiHst}>{fase.fase}</Text>
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
                <Map size={20} color="#FFFFFF" />
                <Text style={styles.locationHeaderText}>Lokasi Sawah</Text>
              </LinearGradient>

              <View style={styles.locationBody}>
                <MapPin size={24} color="#1A202C" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationAddress}>{alamat}</Text>
                  {latitude != null && longitude != null && (
                    <Text style={styles.locationCoordinates}>
                      Koordinat: {latitude}, {longitude}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* ================================================= */}
            {/* TOMBOL PANEN SEKARANG!                            */}
            {/* ================================================= */}
            <Pressable
              onPress={() => router.replace(dariHistory ? "/(main)/history" : "/")}
              style={styles.harvestButtonWrapper}
            >
              <LinearGradient
                colors={["#105C2E", "#3A6827"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.harvestButton}
              >
                <Text style={styles.harvestButtonText}>Panen Sekarang!</Text>
              </LinearGradient>
            </Pressable>

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
      <Text style={styles.fallbackHeaderTitle}>{title}</Text>
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
        <Text style={styles.pupukPairLabel}>{label}</Text>
      </View>
      <View style={styles.pupukPairValueBox}>
        <Text style={styles.pupukPairValueText}>{value}</Text>
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
          <PupukFaseItem label="Urea" value={`${f.urea} kg`} />
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

  const f = fase as JadwalFaseTunggal & Partial<JadwalFaseMajemukPadi>;

  return (
    <>
      <View style={styles.rekomendasiTopRow}>
        <PupukFaseItem label="Urea" value={`${f.urea ?? 0} kg`} />
        {f.sp36 !== undefined && (
          <PupukFaseItem label="SP-36" value={`${f.sp36} kg`} />
        )}
        {f.kcl !== undefined && (
          <PupukFaseItem label="KCL" value={`${f.kcl} kg`} />
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
        <Text style={styles.pupukFaseLabelText}>{label}</Text>
      </View>
      <View style={styles.pupukFaseValue}>
        <Text style={styles.pupukFaseValueText}>{value}</Text>
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
        <Text style={styles.pupukFaseLabelText}>{label}</Text>
      </View>
      <View style={styles.pupukFaseValue}>
        <Text style={styles.pupukFaseValueText}>{value}</Text>
      </View>
    </View>
  );
}

// =======================================================
// STYLES
// =======================================================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  headerGradient: {
    width: "100%",
    paddingTop: scale(46),
    paddingBottom: scale(20),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
    alignItems: "center",
  },

  headerTitleRow: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(16),
    paddingHorizontal: scale(16),
  },

  backButton: {
    position: "absolute",
    left: scale(16),
    zIndex: 1,
  },

  headerTitleText: {
    color: "#FFFFFF",
    fontSize: scale(19),
    fontFamily: "PoppinsBold",
  },

  landCard: {
    width: scale(336),
    minHeight: scale(115),
    borderRadius: scale(16),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  cropImage: {
    width: scale(48),
    height: scale(62),
    resizeMode: "contain",
  },

  landInfoContainer: {
    flex: 1,
    marginLeft: scale(12),
  },

  landTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: scale(2),
  },

  landName: {
    color: "#1A202C",
    fontFamily: "PoppinsSemiBold",
    fontSize: scale(15),
    flex: 1,
  },

  plantDate: {
    color: "#4A5568",
    fontFamily: "PoppinsMedium",
    fontSize: scale(10),
    marginLeft: scale(6),
    marginTop: scale(2),
  },

  cropBadge: {
    width: scale(128),
    height: scale(20),
    borderRadius: scale(5),
    marginBottom: scale(6),
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
    fontSize: scale(11.5),
  },

  landDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(2),
  },

  landDetailLabel: {
    color: "#1A202C",
    fontFamily: "PoppinsSemiBold",
    fontSize: scale(11.5),
    marginLeft: scale(6),
  },

  landDetailValue: {
    fontFamily: "PoppinsMedium",
    fontSize: scale(11.5),
  },

  bodyWrapper: {
    marginTop: scale(16),
    alignItems: "center",
    paddingHorizontal: scale(16),
  },

  section: {
    width: "100%",
    marginBottom: scale(16),
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
  },

  sectionTitle: {
    color: "#252525",
    fontFamily: "PoppinsBold",
    fontSize: scale(15),
  },

  sectionSub: {
    color: "#666666",
    fontFamily: "PoppinsMedium",
    fontSize: scale(9.5),
    textAlign: "center",
    marginTop: scale(2),
    marginBottom: scale(12),
  },

  soilGrid: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: scale(8),
  },

  soilCard: {
    flex: 1,
    borderRadius: scale(6),
    overflow: "hidden",
    backgroundColor: "#A2E0A2",
    elevation: 2,
  },

  soilCardHeader: {
    backgroundColor: "#2C8A43",
    paddingVertical: scale(6),
    alignItems: "center",
    justifyContent: "center",
  },

  soilLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
  },

  soilCardLabel: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(13),
  },

  soilCardBody: {
    backgroundColor: "#A2E0A2",
    paddingVertical: scale(8),
    alignItems: "center",
    justifyContent: "center",
  },

  soilCardValue: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(15),
    textAlign: "center",
  },

  mainSectionTitle: {
    color: "#000000",
    fontFamily: "PoppinsBold",
    fontSize: scale(15),
    marginBottom: scale(8),
  },

  pupukContainer: {
    width: "100%",
    backgroundColor: "#006134",
    borderRadius: scale(10),
    padding: scale(8),
  },

  pupukGrid2x2: {
    gap: scale(8),
  },

  pupukRow: {
    flexDirection: "row",
    gap: scale(8),
  },

  pupukPairPill: {
    flex: 1,
    borderRadius: scale(8),
    overflow: "hidden",
  },

  pupukPairLabelBox: {
    backgroundColor: "#238B43",
    paddingVertical: scale(5),
    alignItems: "center",
    justifyContent: "center",
  },

  pupukPairLabel: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(13),
    textAlign: "center",
  },

  pupukPairValueBox: {
    backgroundColor: "#B2E7A9",
    paddingVertical: scale(6),
    alignItems: "center",
    justifyContent: "center",
  },

  pupukPairValueText: {
    color: "#000000",
    fontFamily: "PoppinsBold",
    fontSize: scale(14),
    textAlign: "center",
  },

  rekomendasiCard: {
    backgroundColor: "#B2E7A9",
    borderRadius: scale(10),
    overflow: "hidden",
    marginBottom: scale(12),
    padding: scale(10),
  },

  rekomendasiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },

  rekomendasiLabel: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(14),
  },

  rekomendasiHst: {
    color: "#000000",
    fontFamily: "PoppinsMedium",
    fontSize: scale(14),
  },

  rekomendasiTopRow: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: scale(8),
  },

  rekomendasiBottomRow: {
    gap: scale(8),
  },

  pupukFaseItem: {
    flex: 1,
    borderRadius: scale(8),
    overflow: "hidden",
  },

  pupukFaseItemFull: {
    borderRadius: scale(8),
    overflow: "hidden",
  },

  pupukFaseLabel: {
    backgroundColor: "#51A927",
    paddingVertical: scale(4),
    alignItems: "center",
  },

  pupukFaseLabelText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(12),
  },

  pupukFaseValue: {
    backgroundColor: "#105C2E",
    paddingVertical: scale(10),
    alignItems: "center",
    justifyContent: "center",
  },

  pupukFaseValueText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(12),
  },

  locationCard: {
    width: "100%",
    marginTop: scale(4),
    marginBottom: scale(20),
    borderRadius: scale(8),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#B8D3C0",
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },

  locationHeader: {
    height: scale(44),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },

  locationHeaderText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(15),
  },

  locationBody: {
    padding: scale(12),
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(10),
  },

  locationAddress: {
    color: "#1A202C",
    fontFamily: "PoppinsMedium",
    fontSize: scale(11),
  },

  locationCoordinates: {
    color: "#64748B",
    fontFamily: "PoppinsRegular",
    fontSize: scale(9.5),
    marginTop: scale(2),
  },

  harvestButtonWrapper: {
    width: "100%",
    borderRadius: scale(12),
    overflow: "hidden",
    marginBottom: scale(20),
  },

  harvestButton: {
    paddingVertical: scale(14),
    alignItems: "center",
    justifyContent: "center",
  },

  harvestButtonText: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(16),
  },

  fallbackHeader: {
    backgroundColor: "#105C2E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
  },

  fallbackHeaderTitle: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: scale(16),
  },

  emptyText: {
    color: COLORS.text,
    textAlign: "center",
    marginTop: scale(40),
    paddingHorizontal: scale(24),
  },
});