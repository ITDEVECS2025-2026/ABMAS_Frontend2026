import React, { useMemo, useRef } from "react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, Animated, Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useSensorStore } from "@/store/sensorContext";
import { getRekomendasi } from "@/utils/ruleEngine";
import {
  Varietas, JenisPupuk, RasioNPK,
  JadwalFaseTunggal, JadwalFaseMajemukPadi, JadwalFaseMajemukJagung,
} from "@/utils/ruleEngine";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 32;


export default function RekomendasiScreen() {
  const params = useLocalSearchParams<{
    sensorId: string;
    varietas: string;
    luasLahan: string;
    targetHasilPanen: string;
    jenisPupuk: string;
    rasioNPK?: string;
  }>();

  const { getSensorById } = useSensorStore();
  const sensor = getSensorById(params.sensorId);

  const varietas = (params.varietas as Varietas) ?? "padi";
  const jenisPupuk = (params.jenisPupuk as JenisPupuk) ?? "tunggal";
  const rasioNPK = params.rasioNPK as RasioNPK | undefined;

    const scrollX = useRef(new Animated.Value(0)).current;  // ← taruh di sini
  // ── Jalankan Rule Engine ──────────────────────────
  const hasil = useMemo(() => {
    if (!sensor) return null;
    return getRekomendasi(
      {
        n: sensor.soilData.N,
        p: sensor.soilData.P,
        k: sensor.soilData.K,
        ec: sensor.soilData.EC,
        ph: sensor.soilData.pH,
      },
      {
        tanamanDipilih: varietas,
        luasLahan: parseFloat(params.luasLahan) || 0,
        targetHasilPanen: parseFloat(params.targetHasilPanen) || 0,
        jenisPupukDipilih: jenisPupuk,
        rasioNPKDipilih: rasioNPK,
      }
    );
  }, [sensor, varietas, jenisPupuk, rasioNPK, params.luasLahan, params.targetHasilPanen]);

  if (!sensor || !hasil) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: COLORS.text, textAlign: "center", marginTop: 40 }}>
          Data sensor tidak ditemukan
        </Text>
      </SafeAreaView>
    );
  }

  const isMajemuk = jenisPupuk === "majemuk";
  const judulVarietas = varietas === "padi" ? "Padi" : "Jagung";
  const judulJenis = isMajemuk ? "Majemuk" : "Tunggal";

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <ScreenHeader title={sensor.name} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── Kondisi Tanah ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Kondisi Tanah</Text>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.textMuted} />
          </View>
          <Text style={styles.sectionSub}>
            Pembaruan terakhir : {/* getTimeAgo(sensor.lastUpdated) */}
          </Text>

          <View style={styles.soilGrid}>
            {[
              { label: "N", value: `${sensor.soilData.N} mg/kg` },
              { label: "P", value: `${sensor.soilData.P} mg/kg` },
              { label: "K", value: `${sensor.soilData.K} mg/kg` },
            ].map((item) => (
              <View key={item.label} style={styles.soilCard}>
                <View style={styles.soilCardHeader}>
                  <Text style={styles.soilCardLabel}>{item.label}</Text>
                </View>
                <View style={styles.soilCardBody}>
                  <Text style={styles.soilCardValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.soilGrid}>
            <View style={[styles.soilCard, { flex: 1.2 }]}>
              <View style={styles.soilCardHeader}>
                <Text style={styles.soilCardLabel}>EC</Text>
              </View>
              <View style={styles.soilCardBody}>
                <Text style={styles.soilCardValue}>{sensor.soilData.EC} mS/cm</Text>
              </View>
            </View>
            <View style={[styles.soilCard, { flex: 0.8 }]}>
              <View style={styles.soilCardHeader}>
                <Text style={styles.soilCardLabel}>pH</Text>
              </View>
              <View style={styles.soilCardBody}>
                <Text style={styles.soilCardValue}>{sensor.soilData.pH}</Text>
              </View>
            </View>
          </View>
        </View>

{/* ── Pupuk (Dosis per Ha) ── */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Pupuk</Text>
  <View style={styles.pupukContainer}>
    <View style={styles.pupukGrid}>
      <PupukPair label="Nitrogen" value="Urea" />
      <PupukPair label="Fosfat" value="SP-36" />
      <PupukPair label="Kalium" value="KCL" />
      <PupukPair label="Pupuk Majemuk" value={`NPK ${rasioNPK ?? "15:15:15"}`} />
    </View>
  </View>
</View>

        {/* ── Rekomendasi (Jadwal per Fase) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rekomendasi</Text>
          <Text style={styles.sectionSub}>
            Luas lahan: {params.luasLahan} Ha · Target: {params.targetHasilPanen} Ton/Ha
            ({hasil.targetPanen.produktivitas})
          </Text>

        {hasil.jadwal.map((fase, idx) => (
          <View key={idx} style={styles.rekomendasiCard}>
          <View style={styles.rekomendasiHeaderRow}>
            <Text style={styles.rekomendasiLabel}>Pemupukan ke-{idx + 1}</Text>
            <Text style={styles.rekomendasiHst}>{fase.fase}</Text>
          </View>
        {renderFaseItems(fase, isMajemuk, varietas, rasioNPK)}
        </View>
        ))}

        </View>

        {/* ── Peringatan ── */}
{/* ── Peringatan ── */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Peringatan</Text>
  <Animated.ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    style={styles.peringatanScrollView}
    onScroll={Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: true }
    )}
    scrollEventThrottle={16}
  >
    {getPeringatanItems(sensor.soilData.pH, sensor.soilData.EC).map((item, i) => {
      const inputRange = [
        (i - 1) * CARD_WIDTH,
        i * CARD_WIDTH,
        (i + 1) * CARD_WIDTH,
      ];
      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0.4, 1, 0.4],
        extrapolate: "clamp",
      });
      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.92, 1, 0.92],
        extrapolate: "clamp",
      });
      return (
        <Animated.View
          key={i}
          style={[styles.peringatanBox, { opacity, transform: [{ scale }] }]}
        >
          <Text style={styles.peringatanTitle}>{item.title}</Text>
          <Text style={styles.peringatanDesc}>{item.desc}</Text>
        </Animated.View>
      );
    })}
  </Animated.ScrollView>
</View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Komponen kecil: pasangan label-value pupuk ──
function PupukPair({ label, value }: { label: string; value: string }) {
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

// ── Render isi tiap fase, sesuaikan dengan tipe data yang berbeda ──
function renderFaseItems(
  fase: JadwalFaseTunggal | JadwalFaseMajemukPadi | JadwalFaseMajemukJagung,
  isMajemuk: boolean,
  varietas: Varietas,
  rasioNPK?: RasioNPK
) {
  // Jagung Majemuk: shape { fase, npk, urea }
  if (varietas === "jagung" && isMajemuk) {
    const f = fase as JadwalFaseMajemukJagung;
    return (
      <>
        <View style={styles.rekomendasiTopRow}>
          <PupukFaseItem label="Urea" value={`${f.urea} kg`} />
        </View>
        <View style={styles.rekomendasiBottomRow}>
          <PupukFaseItemFull label={`NPK ${rasioNPK ?? "15:15:15"}`} value={`${f.npk} kg`} />
        </View>
      </>
    );
  }

  // Padi Tunggal/Majemuk dan Jagung Tunggal: shape { fase, urea, sp36, kcl, (npk?) }
  const f = fase as JadwalFaseTunggal & Partial<JadwalFaseMajemukPadi>;
  return (
    <>
      <View style={styles.rekomendasiTopRow}>
        <PupukFaseItem label="Urea" value={`${f.urea} kg`} />
        <PupukFaseItem label="SP-36" value={`${f.sp36} kg`} />
        <PupukFaseItem label="KCL" value={`${f.kcl} kg`} />
      </View>
      {isMajemuk && f.npk !== undefined && (
        <View style={styles.rekomendasiBottomRow}>
          <PupukFaseItemFull label={`NPK ${rasioNPK ?? "15:15:15"}`} value={`${f.npk} kg`} />
        </View>
      )}
    </>
  );
}

function PupukFaseItem({ label, value }: { label: string; value: string }) {
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

function PupukFaseItemFull({ label, value }: { label: string; value: string }) {
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
function getPeringatanItems(pH: number, EC: number) {
  const items: { title: string; desc: string }[] = [];

  // pH
  if (pH < 6.5) {
    items.push({
      title: "pH tanah anda tergolong rendah.",
      desc: "Lakukan penyesuaian dengan penambahan dolomit dan lakukan pengecekan ulang secara berkala.",
    });
  } else if (pH > 7.5) {
    items.push({
      title: "pH tanah anda tergolong alkalin.",
      desc: "Disarankan penambahan sulfur untuk menurunkan pH agar kembali optimal.",
    });
  }

  // EC
  if (EC < 2.0) {
    items.push({
      title: "Salinitas tanah berada dalam kondisi normal.",
      desc: "Tidak diperlukan tindakan khusus, tetap lakukan pemantauan rutin.",
    });
  } else if (EC <= 3.0) {
    items.push({
      title: "Salinitas tanah berada pada tingkat sedang.",
      desc: "Lakukan monitoring untuk mencegah peningkatan yang dapat mempengaruhi tanaman.",
    });
  } else {
    items.push({
      title: "Salinitas tanah tergolong tinggi.",
      desc: "Berpotensi menurunkan produktivitas, diperlukan penanganan lebih lanjut.",
    });
  }

  // Kondisi gabungan: pH & EC keduanya bermasalah
  const phBermasalah = pH < 6.5 || pH > 7.5;
  const ecBermasalah = EC > 2.0;
  if (phBermasalah && ecBermasalah) {
    items.push({
      title: "Kondisi tanah tidak optimal.",
      desc: "pH dan salinitas berada di luar batas normal, perlu penanganan segera agar tidak mengganggu pertumbuhan tanaman.",
    });
  }

  return items;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  container: { flex: 1, padding: 16 },

  section: { marginBottom: 20 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
  },
  sectionSub: { color: COLORS.textMuted, fontSize: 11, marginBottom: 10 },

  // Kondisi Tanah
  soilGrid: { flexDirection: "row", gap: 8, marginBottom: 8 },
  soilCard: { flex: 1, borderRadius: 6, overflow: "hidden" },
  soilCardHeader: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 6,
    alignItems: "center",
  },
  soilCardLabel: { color: "#fff", fontWeight: "700", fontSize: 13 },
  soilCardBody: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  soilCardValue: { color: "#fff", fontWeight: "700", fontSize: 12 },

  // Pupuk pairs
pupukContainer: {
  backgroundColor: COLORS.primaryLight,
  borderRadius: 12,
  padding: 12,
},
pupukGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
},
pupukPairPill: {
  width: "47%",
  flexDirection: "row",
  borderRadius: 8,
  overflow: "hidden",
},
pupukPairLabelBox: {
  flex: 1,
  backgroundColor: "#E8F5E9",
  paddingVertical: 10,
  paddingHorizontal: 8,
  justifyContent: "center",
},
pupukPairLabel: {
  color: COLORS.primaryDark,
  fontWeight: "700",
  fontSize: 12,
},
pupukPairValueBox: {
  flex: 1,
  backgroundColor: COLORS.primaryDark,
  paddingVertical: 10,
  paddingHorizontal: 8,
  alignItems: "center",
  justifyContent: "center",
},
pupukPairValueText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 12,
  textAlign: "center",
},

  // Rekomendasi
  rekomendasiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    padding: 10,
  },
  rekomendasiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  rekomendasiLabel: { color: COLORS.primaryDark, fontWeight: "700", fontSize: 13 },
  rekomendasiHst: { color: COLORS.primaryDark, fontSize: 13 },
  pupukBoxText: { color: COLORS.primaryDark, fontWeight: "700", fontSize: 12 },
  rekomendasiTopRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  rekomendasiBottomRow: { gap: 8 },
  pupukFaseItem: { flex: 1, borderRadius: 8, overflow: "hidden" },
  pupukFaseItemFull: { borderRadius: 8, overflow: "hidden" },
  pupukFaseLabel: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    alignItems: "center",
},
pupukFaseLabelText: { color: COLORS.primaryDark, fontWeight: "700", fontSize: 12 },
pupukFaseValue: {
  backgroundColor: COLORS.primaryDark,
  paddingVertical: 16,
  alignItems: "center",
  justifyContent: "center",
},
pupukFaseValueText: { color: "#fff", fontWeight: "700", fontSize: 13 }, 

  // Peringatan
  warningRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  warningText: { fontSize: 12, fontWeight: "600", flex: 1, lineHeight: 18 },

peringatanScroll: {
  gap: 10,
  paddingRight: 16,
},

peringatanScrollView: {
  width: "100%",
},
peringatanBox: {
  backgroundColor: COLORS.primary,
  borderRadius: 10,
  padding: 20,
  marginRight: 16,
  width: CARD_WIDTH - 16, // kurangi marginRight agar card kanan sedikit terlihat saat snap
  minHeight: 110,
},
peringatanTitle: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 14,
  marginBottom: 8,
},
peringatanDesc: {
  color: "#fff",
  fontSize: 12,
  lineHeight: 18,
},
});