// app/(features)/(monitoring)/index.tsx
import React, { useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ruler, Target, Radio } from "lucide-react-native";

import ScreenHeader from "../../../components/ui/ScreenHeader";
import InputSensorIdCard from "../../../components/form/InputSensorIdCard";
import SectionLabel from "../../../components/form/SectionLabel";
import { scale } from "../../../utils/scale";
import { useLahanStore } from "../../../store/lahanStore";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

export default function MonitoringLahanTersimpanPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getLahanById } = useLahanStore();

  const idLahan = params.idLahan ? String(params.idLahan) : null;
  const dataLahanStore = idLahan ? getLahanById(idLahan) : null;

  const namaLahan = dataLahanStore?.namaLahan || (params.namaLahan ? String(params.namaLahan) : "Lahan");
  const tanaman = dataLahanStore?.tanaman || (params.tanaman ? String(params.tanaman) : "PADI");

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

  const [sensorIdInput, setSensorIdInput] = useState("");

  function handleSubmitSensorId(sensorId: string) {
    router.push({
      pathname: "/(features)/(sensor)/[id]",
      params: {
        id: sensorId,
        idLahan,
        namaLahan,
        tanaman,
        tanggalTanam,
        luasLahan,
        targetPanen,
        alamat,
        lat,
        lon,
      },
    } as any);
  }

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
            marginBottom: scale(24),
          }}
        >
          <Image
            source={tanamanIcon}
            style={{ width: scale(49.372), height: scale(64.666), resizeMode: "contain" }}
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
                style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(17), flex: 1 }}
                numberOfLines={1}
              >
                {namaLahan}
              </Text>
              <Text
                style={{ color: "#000000", fontFamily: "PoppinsMedium", fontSize: scale(11), marginLeft: scale(6), marginTop: scale(4) }}
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
                style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(12.5) }}>
                  {tanamanLabel}
                </Text>
              </LinearGradient>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: scale(-3) }}>
              <Ruler size={scale(15)} color="#1A202C" />
              <Text style={{ color: "#1A202C", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>
                Luas Lahan{"  "}:{"  "}
              </Text>
              <Text style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>
                {luasLahan} Hektar
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Target size={scale(13)} color="#000000" />
              <Text style={{ color: "#000000", fontFamily: "PoppinsSemiBold", fontSize: scale(13), marginLeft: scale(6) }}>
                Target Panen{"  "}:{"  "}
              </Text>
              <Text style={{ color: "#1A202C", fontFamily: "PoppinsMedium", fontSize: scale(13) }}>
                {targetPanen} ton/Hektar
              </Text>
            </View>
          </View>
        </View>

        {/* Input ID Sensor */}
        <View style={{ width: scale(336), alignSelf: "center" }}>
          <View style={{ marginBottom: scale(12) }}>
            <SectionLabel icon={Radio} label="Input ID Sensor" />
          </View>

          <InputSensorIdCard
            value={sensorIdInput}
            onChangeText={setSensorIdInput}
            onSubmit={handleSubmitSensorId}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}