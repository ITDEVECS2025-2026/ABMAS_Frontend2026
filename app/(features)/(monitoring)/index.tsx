// app/(features)/(monitoring)/index.tsx
import React from "react";
import { View, Text, Image, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ruler, Target, Radio, Map, MapPin } from "lucide-react-native";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import { scale } from "../../../utils/scale";
import { useLahanStore } from "../../../store/lahanStore"; // <-- IMPORT STORE ZUSTAND

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

const SENSOR_IDS = ["1", "2", "3", "4", "5"];

export default function MonitoringLahanTersimpanPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getLahanById } = useLahanStore();

  // 1. Cek apakah ada idLahan yang dilempar (saat user klik card dari halaman History)
  const idLahan = params.idLahan ? String(params.idLahan) : null;
  const dataLahanStore = idLahan ? getLahanById(idLahan) : null;

  // 2. LOGIKA JEMBATAN: Prioritaskan ambil dari Store (History), kalau kosong ambil dari Parameter (Lahan Baru)
  const namaLahan = dataLahanStore?.namaLahan || (params.namaLahan ? String(params.namaLahan) : "Lahan");
  const tanaman = dataLahanStore?.tanaman || (params.tanaman ? String(params.tanaman) : "PADI");
  
  // Format tanggal fleksibel
  let tanggalTanam = "-";
  if (dataLahanStore?.tanggalTanam) {
    tanggalTanam = new Date(dataLahanStore.tanggalTanam).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } else if (params.tanggalTanam) {
    tanggalTanam = String(params.tanggalTanam);
  }

  const luasLahan = dataLahanStore?.luasLahan ? String(dataLahanStore.luasLahan) : (params.luasLahan ? String(params.luasLahan) : "-");
  const targetPanen = dataLahanStore?.targetPanen ? String(dataLahanStore.targetPanen) : (params.targetPanen ? String(params.targetPanen) : "-");
  const alamat = dataLahanStore?.lokasi?.alamat || (params.alamat ? String(params.alamat) : "-");
  const lat = dataLahanStore?.lokasi?.lat ? String(dataLahanStore.lokasi.lat) : (params.lat ? String(params.lat) : "");
  const lon = dataLahanStore?.lokasi?.lon ? String(dataLahanStore.lokasi.lon) : (params.lon ? String(params.lon) : "");

  const tanamanIcon = tanaman === "JAGUNG" ? jagungIcon : padiIcon;
  const tanamanLabel = tanaman === "JAGUNG" ? "Tanaman Jagung" : "Tanaman Padi";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title={namaLahan} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: scale(40),
          alignItems: "center",
        }}
      >
        {/* Card Info Lahan */}
        <View
          style={{
            width: scale(336),
            height: scale(120),
            borderRadius: scale(16.972),
            borderWidth: scale(0.424),
            borderColor: "#4A5468",
            backgroundColor: "#FFFFFF",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: scale(18),
            marginTop: scale(16),
            marginBottom: scale(15),
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
                  marginTop: scale(4)
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

        {/* Daftar Sensor */}
        <View style={{ width: scale(336), alignSelf: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: scale(8),
              marginBottom: scale(6),
            }}
          >
            <Radio size={scale(26)} color="#1A202C" />
            <Text
              style={{
                color: "#1A202C",
                fontFamily: "PoppinsBold",
                fontSize: scale(18),
              }}
            >
              Daftar Sensor
            </Text>
          </View>

          {SENSOR_IDS.map((id) => (
            <Pressable
              key={id}
              onPress={() =>
                router.push({
                  pathname: "/(features)/(sensor)/[id]",
                  params: {
                    id, // ID Sensor
                    namaLahan, // Ngalir terus sampai ke Varietas
                    tanaman,
                    tanggalTanam,
                    luasLahan,
                    targetPanen,
                    alamat,
                    lat,
                    lon,
                  },
                } as any)
              }
              style={{ marginBottom: scale(8) }}
            >
              <LinearGradient
                colors={["#105C2E", "#8C6A09"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.6, y: 0 }}
                style={{
                  width: scale(337),
                  height: scale(43.788),
                  borderRadius: scale(9.759),
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: scale(1.697) },
                  shadowOpacity: 0.25,
                  shadowRadius: scale(1.697),
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "PoppinsSemiBold",
                    fontSize: scale(18),
                  }}
                >
                  Sensor {id}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Lokasi Sawah */}
        <View style={{ marginTop: scale(24) }}>
          <View
            style={{
              width: scale(336),
              borderRadius: scale(6.05),
              borderWidth: scale(0.403),
              borderColor: "#006134",
              backgroundColor: "#FFFFFF",
              alignSelf: "center",
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
              <Map size={scale(20)} color="#FFFFFF" />
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
                paddingHorizontal: scale(12),
                paddingVertical: scale(12),
              }}
            >
              <MapPin size={scale(27)} color="#006134" />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    color: "#1A202C",
                    fontFamily: "PoppinsMedium",
                    fontSize: scale(13),
                  }}
                >
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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}