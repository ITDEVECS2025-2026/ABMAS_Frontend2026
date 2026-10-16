import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Ruler,
    Sprout,
    Target
} from "lucide-react-native";
import React, { useState } from "react";
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

import { saveHarvestData } from "@/lib/api";
import { useLahanStore } from "../../../store/lahanStore";
import { scale } from "../../../utils/scale";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

const textStyle = {
  color: "#1A202C",
  fontFamily: "PoppinsRegular" as const,
};

export default function MonitoringLahanTersimpanPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ idLahan?: string }>();

  const { getLahanById, getRentangSensorId } = useLahanStore();

  const idLahan = params.idLahan ? String(params.idLahan) : null;
  const dataLahan = idLahan ? getLahanById(idLahan) : null;
  const rentangSensor = idLahan
    ? getRentangSensorId(idLahan)
    : undefined;

  const namaLahan = dataLahan?.namaLahan || "Lahan";
  const tanaman = dataLahan?.tanaman || "PADI";
  const luasLahan = dataLahan?.luasLahan ?? 0;
  const targetPanen = dataLahan?.targetPanen ?? 0;
  const alamat = dataLahan?.lokasi?.alamat || "-";
  const lat = dataLahan?.lokasi?.lat;
  const lon = dataLahan?.lokasi?.lon;

  const tanggalTanam = dataLahan?.tanggalTanam
    ? new Date(dataLahan.tanggalTanam).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const tanamanIcon = tanaman === "JAGUNG" ? jagungIcon : padiIcon;
  const tanamanLabel =
    tanaman === "JAGUNG" ? "Tanaman Jagung" : "Tanaman Padi";

  const [isPanen, setIsPanen] = useState(false);
  const [isModalPanenVisible, setIsModalPanenVisible] = useState(false);
  const [inputHasilPanen, setInputHasilPanen] = useState("");
  const [isSavingPanen, setIsSavingPanen] = useState(false);


  const handleSimpanPanen = async () => {
    const hasil = Number(inputHasilPanen.replace(",", "."));

    if (!idLahan || !dataLahan) {
      Alert.alert("Data tidak ditemukan", "Silakan kembali dan pilih lahan.");
      return;
    }

    if (!inputHasilPanen.trim() || !Number.isFinite(hasil) || hasil < 0) {
      Alert.alert("Input tidak valid", "Masukkan hasil panen yang valid.");
      return;
    }

    setIsSavingPanen(true);

    try {
      await saveHarvestData({
        namaLahan,
        tanaman,
        tanggalTanam: dataLahan.tanggalTanam
          ? new Date(dataLahan.tanggalTanam).toISOString()
          : new Date().toISOString(),
        luasLahan: Number(luasLahan) || 0,
        targetPanen: Number(targetPanen) || 0,
        hasilPanenAktual: hasil,
        rentangSensor: {
          sensorIdAwal: String(rentangSensor?.dari ?? 0),
          sensorIdAkhir: String(rentangSensor?.sampai ?? 0),
        },
      });

      setIsModalPanenVisible(false);
      setIsPanen(true);
      setInputHasilPanen("");

      Alert.alert("Berhasil", "Data hasil panen berhasil disimpan.");
    } catch (error) {
      console.error("Gagal menyimpan hasil panen:", error);
      Alert.alert(
        "Gagal menyimpan",
        "Data hasil panen belum berhasil disimpan. Silakan coba lagi."
      );
    } finally {
      setIsSavingPanen(false);
    }
  };

  if (!idLahan || !dataLahan) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          justifyContent: "center",
          alignItems: "center",
          padding: scale(24),
        }}
      >
        <Sprout size={scale(42)} color="#34734A" />

        <Text
          style={{
            ...textStyle,
            fontSize: scale(16),
            marginTop: scale(12),
            textAlign: "center",
          }}
        >
          Data lahan tidak ditemukan.
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: scale(16) }}
        >
          <Text
            style={{
              color: "#006134",
              fontFamily: "PoppinsSemiBold",
              fontSize: scale(14),
            }}
          >
            Kembali ke Riwayat
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Modal
        visible={isModalPanenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalPanenVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              width: scale(310),
              borderRadius: scale(16),
              padding: scale(20),
            }}
          >
            <Text
              style={{
                fontFamily: "PoppinsBold",
                fontSize: scale(18),
                color: "#1A202C",
                marginBottom: scale(16),
              }}
            >
              Hasil Panen
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: scale(8),
                paddingHorizontal: scale(12),
                height: scale(45),
                marginBottom: scale(24),
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontFamily: "PoppinsRegular",
                  fontSize: scale(13),
                  color: "#1A202C",
                }}
                placeholder="Masukkan hasil panen..."
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={inputHasilPanen}
                onChangeText={setInputHasilPanen}
              />

              <Text
                style={{
                  fontFamily: "PoppinsMedium",
                  fontSize: scale(12),
                  color: "#64748B",
                }}
              >
                ton/Ha
              </Text>
            </View>

            <Pressable
              disabled={isSavingPanen}
              onPress={handleSimpanPanen}
              style={{ opacity: isSavingPanen ? 0.6 : 1 }}
            >
              <LinearGradient
                colors={["#105C2E", "#8C6A09"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: scale(8),
                  paddingVertical: scale(12),
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "PoppinsBold",
                    fontSize: scale(15),
                  }}
                >
                  {isSavingPanen ? "Menyimpan..." : "Simpan"}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => setIsModalPanenVisible(false)}
              style={{ alignItems: "center", paddingTop: scale(14) }}
            >
              <Text style={{ color: "#64748B", fontSize: scale(13) }}>
                Batal
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: scale(40) }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#1B5E20", "#4D6B13", "#767614"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: "100%",
            paddingTop: scale(50),
            paddingBottom: scale(24),
            borderBottomLeftRadius: scale(24),
            borderBottomRightRadius: scale(24),
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: scale(20),
              paddingHorizontal: scale(16),
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                position: "absolute",
                left: scale(16),
                zIndex: 1,
              }}
            >
              <ArrowLeft color="#FFFFFF" size={scale(24)} />
            </Pressable>

            <Text
              style={{
                color: "#FFFFFF",
                fontSize: scale(20),
                fontFamily: "PoppinsBold",
              }}
            >
              Data Lahan
            </Text>
          </View>

          <View
            style={{
              width: scale(336),
              minHeight: scale(120),
              borderRadius: scale(16),
              backgroundColor: "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: scale(18),
              paddingVertical: scale(12),
              elevation: 4,
            }}
          >
            <Image
              source={tanamanIcon}
              style={{
                width: scale(49),
                height: scale(65),
                resizeMode: "contain",
              }}
            />

            <View style={{ flex: 1, marginLeft: scale(12) }}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#1A202C",
                  fontFamily: "PoppinsSemiBold",
                  fontSize: scale(17),
                }}
              >
                {namaLahan}
              </Text>

              <View
                style={{
                  alignSelf: "flex-start",
                  borderRadius: scale(5),
                  marginVertical: scale(5),
                  paddingHorizontal: scale(8),
                  paddingVertical: scale(3),
                  backgroundColor: "#187245",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "PoppinsMedium",
                    fontSize: scale(11),
                  }}
                >
                  {tanamanLabel}
                </Text>
              </View>

              <Text
                style={{
                  color: "#000000",
                  fontFamily: "PoppinsMedium",
                  fontSize: scale(10),
                  marginBottom: scale(5),
                }}
              >
                {tanggalTanam}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: scale(4),
                }}
              >
                <Ruler size={scale(14)} color="#1A202C" />
                <Text
                  style={{
                    color: "#1A202C",
                    fontFamily: "PoppinsMedium",
                    fontSize: scale(11),
                    marginLeft: scale(5),
                  }}
                >
                  Luas: {luasLahan} hektar
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Target size={scale(14)} color="#1A202C" />
                <Text
                  style={{
                    color: "#1A202C",
                    fontFamily: "PoppinsMedium",
                    fontSize: scale(11),
                    marginLeft: scale(5),
                  }}
                >
                  Target: {targetPanen} ton/Ha
                </Text>
              </View>
            </View>
          </View>

        </LinearGradient>

        <View
          style={{
            flex: 1,
            marginTop: scale(24),
            paddingHorizontal: scale(20),
            alignItems: "center",
          }}
        >
          {isPanen ? (
            <View style={{ width: "100%", alignItems: "center", marginTop: scale(30) }}>
              <Text
                style={{
                  ...textStyle,
                  fontSize: scale(14),
                  marginBottom: scale(20),
                  textAlign: "center",
                }}
              >
                Data panen berhasil disimpan.
              </Text>

              <Pressable
                onPress={() => router.replace("/(features)/(lahan)" as any)}
                style={{ width: "100%" }}
              >
                <LinearGradient
                  colors={["#105C2E", "#8C6A09"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: scale(12),
                    paddingVertical: scale(12),
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(15) }}>
                    Kembali ke Lahan
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <>
              <Text
                style={{
                  ...textStyle,
                  fontSize: scale(14),
                  textAlign: "center",
                  lineHeight: scale(22),
                  marginBottom: scale(18),
                }}
              >
                Anda belum melakukan rekomendasi pemupukan!
              </Text>

              <Pressable
                onPress={() => {
                  if (!idLahan || !dataLahan) {
                    Alert.alert("Data tidak ditemukan", "Silakan pilih lahan kembali.");
                    return;
                  }

                  router.push({
                    pathname: "/(features)/(rekomendasi)",
                    params: { idLahan: String(idLahan) },
                  } as any);
                }}
                style={{ width: "100%", marginBottom: scale(20) }}
              >
                <LinearGradient
                  colors={["#105C2E", "#8C6A09"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: scale(12),
                    paddingVertical: scale(14),
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(15) }}>
                    Rekomendasi Pemupukan
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => setIsModalPanenVisible(true)}
                style={{ width: "100%", marginTop: scale(450) }}
              >
                <LinearGradient
                  colors={["#105C2E", "#588157"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: scale(12),
                    paddingVertical: scale(14),
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>
                    Panen Sekarang!
                  </Text>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}