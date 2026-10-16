
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Sprout, MapPin, Target, Ruler } from "lucide-react-native";

import { useLahanStore } from "../../../store/lahanStore";

export default function DetailLahanPage() {
  const params = useLocalSearchParams<{
    idLahan?: string | string[];
  }>();

  const idLahan = Array.isArray(params.idLahan)
    ? params.idLahan[0]
    : params.idLahan;

  // Ambil data lahan yang dipilih dari Zustand.
  const lahanList = useLahanStore((state) => state.lahanList);

  const lahan = lahanList.find(
    (item) => String(item.id) === String(idLahan)
  );

  const formatTanggal = (tanggal?: string) => {
    if (!tanggal) return "-";

    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleRekomendasi = () => {
    if (!idLahan || !lahan) {
      Alert.alert("Gagal", "Data lahan tidak ditemukan.");
      return;
    }

    router.push({
      pathname: "/(features)/(rekomendasi)",
      params: {
        idLahan: String(lahan.id),
      },
    } as any);
  };

  if (!lahan) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundTitle}>
          Lahan tidak ditemukan
        </Text>

        <Text style={styles.notFoundText}>
          Data lahan tidak ditemukan di penyimpanan lokal.
          Silakan kembali ke halaman History.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(features)/(history)" as any)}
        >
          <Text style={styles.backButtonText}>
            Kembali ke History
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isJagung = lahan.tanaman === "JAGUNG";

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#105C2E", "#52651D", "#716B0D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backIcon}
          accessibilityLabel="Kembali"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Data Lahan</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* KARTU IDENTITAS LAHAN */}
        <View style={styles.lahanCard}>
          <View style={styles.plantIconContainer}>
            <Sprout
              size={42}
              color="#28783B"
              strokeWidth={1.8}
            />
          </View>

          <View style={styles.lahanInfo}>
            <Text style={styles.namaLahan} numberOfLines={2}>
              {lahan.namaLahan}
            </Text>

            <View style={styles.tanamanBadge}>
              <Text style={styles.tanamanText}>
                {isJagung ? "Tanaman Jagung" : "Tanaman Padi"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ruler size={13} color="#263238" />

              <Text style={styles.infoLabel}>Luas Lahan</Text>
              <Text style={styles.separator}>:</Text>

              <Text style={styles.infoValue}>
                {lahan.luasLahan} Hektar
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Target size={13} color="#263238" />

              <Text style={styles.infoLabel}>Target Panen</Text>
              <Text style={styles.separator}>:</Text>

              <Text style={styles.infoValue}>
                {lahan.targetPanen} ton/Hektar
              </Text>
            </View>
          </View>

          <Text style={styles.tanggalTanam}>
            {formatTanggal(lahan.tanggalTanam)}
          </Text>
        </View>

        {/* DETAIL INFORMASI */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>
            Informasi Lahan
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jenis Tanaman</Text>
            <Text style={styles.detailValue}>
              {isJagung ? "Jagung" : "Padi"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal Tanam</Text>
            <Text style={styles.detailValue}>
              {formatTanggal(lahan.tanggalTanam)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jenis Pupuk</Text>
            <Text style={styles.detailValue}>
              {lahan.pupuk || "-"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Lokasi</Text>

            <View style={styles.locationValue}>
              <MapPin size={14} color="#28783B" />

              <Text style={styles.detailValue}>
                {lahan.lokasi?.alamat || "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* TOMBOL REKOMENDASI */}
        <View style={styles.rekomendasiCard}>
          <Text style={styles.rekomendasiTitle}>
            Rekomendasi Pemupukan
          </Text>

          <Text style={styles.rekomendasiDescription}>
            Dapatkan rekomendasi pemupukan untuk{" "}
            {lahan.namaLahan} berdasarkan data lahan dan data
            recording sensor yang terkait.
          </Text>

          <TouchableOpacity
            onPress={handleRekomendasi}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={["#105C2E", "#8C6A09"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rekomendasiButton}
            >
              <Text style={styles.rekomendasiButtonText}>
                Rekomendasi Pemupukan
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    minHeight: 105,
    paddingTop: 45,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    position: "absolute",
    left: 18,
    top: 45,
    padding: 3,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
    fontSize: 20,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },

  lahanCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E4E9E3",
    elevation: 2,
  },

  plantIconContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  lahanInfo: {
    flex: 1,
    minWidth: 0,
  },

  namaLahan: {
    fontFamily: "PoppinsBold",
    color: "#202632",
    fontSize: 14,
    marginBottom: 3,
  },

  tanamanBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#43B95A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 5,
  },

  tanamanText: {
    fontFamily: "PoppinsMedium",
    color: "#FFFFFF",
    fontSize: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    flexWrap: "wrap",
  },

  infoLabel: {
    fontFamily: "PoppinsMedium",
    color: "#202632",
    fontSize: 10,
  },

  separator: {
    fontFamily: "PoppinsMedium",
    color: "#202632",
    fontSize: 10,
  },

  infoValue: {
    fontFamily: "PoppinsRegular",
    color: "#202632",
    fontSize: 10,
    flexShrink: 1,
  },

  tanggalTanam: {
    alignSelf: "flex-start",
    color: "#4A5468",
    fontFamily: "PoppinsRegular",
    fontSize: 8,
    marginLeft: 5,
  },

  detailCard: {
    backgroundColor: "#F5F8F3",
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
  },

  sectionTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    color: "#1B4332",
    marginBottom: 12,
  },

  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E7DE",
  },

  detailLabel: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 3,
  },

  detailValue: {
    fontFamily: "PoppinsMedium",
    fontSize: 13,
    color: "#202632",
    flexShrink: 1,
  },

  locationValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  rekomendasiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4E9E3",
  },

  rekomendasiTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 17,
    color: "#1B4332",
    marginBottom: 8,
  },

  rekomendasiDescription: {
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    lineHeight: 19,
    color: "#596579",
    marginBottom: 14,
  },

  rekomendasiButton: {
    minHeight: 46,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  rekomendasiButtonText: {
    fontFamily: "PoppinsBold",
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  notFoundTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 20,
    color: "#1B4332",
    textAlign: "center",
  },

  notFoundText: {
    fontFamily: "PoppinsRegular",
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: "#105C2E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    fontFamily: "PoppinsBold",
    color: "#FFFFFF",
    fontSize: 13,
  },
});
