// app/(features)/(history)/index.tsx — halaman History Pemupukan
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, PlusCircle, Search, SquarePen } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AddLahanCard from "@/components/form/AddlahanCard";
import { useHistoryStore } from "@/store/historystore";
import { useLahanStore } from "@/store/lahanStore";
import { scale } from "@/utils/scale";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const jagungIcon = require("../../styles/assets/jagung icon.png");
const padiIcon = require("../../styles/assets/padi icon.png");

const DETAIL_PATH = "/(features)/(history)/[idLahan]";
const FORM_LAHAN_PATH = "/(features)/(lahan)";
const GRADIENT = ["#105C2E", "#8C6A09"] as const;

type LahanItem = {
  id?: string | number;
  idLahan?: string | number;
  namaLahan?: string;
  nama_lahan?: string;
  nama?: string;
  tanaman?: string;
  jenisTanaman?: string;
  jenis_tanaman?: string;
  tanggalTanam?: string;
  tanggal_tanam?: string;
  [key: string]: unknown;
};

function getNamaLahan(lahan: LahanItem): string {
  const nama =
    lahan.namaLahan ??
    lahan.nama_lahan ??
    lahan.nama ??
    "";
  return String(nama).trim();
}

function getIdLahan(lahan: LahanItem): string {
  const id = lahan.idLahan ?? lahan.id;
  return id == null ? "" : String(id);
}

function getTanggalTanam(lahan: LahanItem): string | undefined {
  const tanggal = lahan.tanggalTanam ?? lahan.tanggal_tanam;
  return typeof tanggal === "string" ? tanggal : undefined;
}

function isTanamanJagung(lahan: LahanItem): boolean {
  const tanaman = String(
    lahan.tanaman ?? lahan.jenisTanaman ?? lahan.jenis_tanaman ?? ""
  ).toUpperCase();
  return tanaman.includes("JAGUNG");
}

export default function HistoryPemupukanPage() {
  const router = useRouter();

  // Mendukung beberapa nama properti yang mungkin dipakai lahanStore.
  const lahanList = useLahanStore(
    (s: any) => s.lahanList ?? s.lahan ?? s.listLahan ?? s.dataLahan ?? []
  ) as LahanItem[];

  const entries = useHistoryStore((s) => s.entries);

  const [query, setQuery] = useState("");
  const [namaBaru, setNamaBaru] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const daftar = Array.isArray(lahanList) ? lahanList : [];
    const kataKunci = query.trim().toLocaleLowerCase("id-ID");

    if (!kataKunci) return daftar;

    return daftar.filter((lahan) =>
      getNamaLahan(lahan).toLocaleLowerCase("id-ID").includes(kataKunci)
    );
  }, [lahanList, query]);

  const formatTanggal = (iso?: string) => {
    if (!iso) return "-";
    const tanggal = new Date(iso);
    if (Number.isNaN(tanggal.getTime())) return "-";
    return tanggal.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleTambah = () => {
    const nama = namaBaru.trim();
    if (!nama) return;

    setShowModal(false);
    setNamaBaru("");
    router.push({
      pathname: FORM_LAHAN_PATH,
      params: { namaLahan: nama },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title="History Pemupukan" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: scale(30),
          paddingTop: scale(16),
          paddingBottom: scale(24),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#EEF2F1",
            borderRadius: scale(20),
            borderWidth: 1,
            borderColor: "#CBD5E1",
            paddingHorizontal: scale(10),
            minHeight: scale(44),
            marginBottom: scale(14),
          }}
        >
          <Search size={scale(17)} color="#64748B" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari nama lahan..."
            placeholderTextColor="#64748B"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            underlineColorAndroid="transparent"
            selectionColor="#105C2E"
            style={{
              flex: 1,
              minWidth: 0,
              height: scale(42),
              marginLeft: scale(8),
              paddingHorizontal: 0,
              paddingVertical: 0,
              includeFontPadding: false,
              textAlignVertical: "center",
              fontFamily: "PoppinsRegular",
              fontSize: scale(12),
              color: "#1A202C",
            }}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian"
              style={{ paddingLeft: scale(8), paddingVertical: scale(4) }}
            >
              <Text
                style={{
                  color: "#64748B",
                  fontFamily: "PoppinsMedium",
                  fontSize: scale(12),
                }}
              >
                ×
              </Text>
            </Pressable>
          )}
        </View>

        {/* List lahan */}
        <View style={{ gap: scale(10), marginBottom: scale(20) }}>
          {filtered.length === 0 && (
            <Text
              style={{
                textAlign: "center",
                color: "#64748B",
                fontFamily: "PoppinsRegular",
                fontSize: scale(12),
                marginVertical: scale(16),
              }}
            >
              {query.trim()
                ? `Lahan dengan nama "${query.trim()}" tidak ditemukan.`
                : "Belum ada lahan. Tambahkan lahan pertamamu di bawah."}
            </Text>
          )}

          {filtered.map((lahan, index) => {
            const id = getIdLahan(lahan);
            const nama = getNamaLahan(lahan) || "Lahan tanpa nama";
            const isJagung = isTanamanJagung(lahan);
            const sudahPanen = !!(id && entries[id]?.panen);

            return (
              <Pressable
                key={id || `${nama}-${index}`}
                onPress={() => {
                  if (!id) {
                    console.warn("ID lahan tidak ditemukan:", lahan);
                    return;
                  }
                  router.push({
                    pathname: DETAIL_PATH,
                    params: { idLahan: id },
                  } as any);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#B7E4B9",
                  borderRadius: scale(15),
                  padding: scale(10),
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Image
                  source={isJagung ? jagungIcon : padiIcon}
                  style={{
                    width: scale(34),
                    height: scale(44),
                    resizeMode: "contain",
                  }}
                />
                <View style={{ flex: 1, minWidth: 0, marginLeft: scale(10) }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      fontFamily: "PoppinsBold",
                      fontSize: scale(16),
                      color: "#1A202C",
                    }}
                  >
                    {nama}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: scale(6),
                      marginTop: scale(2),
                    }}
                  >
                    <LinearGradient
                      colors={["#187245", "#58C15C"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: scale(5.117),
                        paddingHorizontal: scale(8),
                        paddingVertical: scale(3),
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "PoppinsMedium",
                          fontSize: scale(12),
                        }}
                      >
                        {isJagung ? "Tanaman Jagung" : "Tanaman Padi"}
                      </Text>
                    </LinearGradient>
                    {sudahPanen && (
                      <View
                        style={{
                          backgroundColor: "#105C2E",
                          borderRadius: scale(4),
                          paddingHorizontal: scale(6),
                          paddingVertical: scale(1),
                        }}
                      >
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontFamily: "PoppinsMedium",
                            fontSize: scale(9),
                          }}
                        >
                          Sudah dipanen
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text
                  style={{
                    alignSelf: "flex-start",
                    marginLeft: scale(6),
                    fontFamily: "PoppinsRegular",
                    fontSize: scale(9),
                    color: "#4A5468",
                  }}
                >
                  {formatTanggal(getTanggalTanam(lahan))}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Card Tambah Lahan */}
        <View style={{ width: "100%", alignItems: "center" }}>
          <AddLahanCard
            value={namaBaru}
            onChangeText={setNamaBaru}
            onAdd={(nama) => {
              if (!nama.trim()) return;
              setNamaBaru(nama);
              setShowModal(false);
            }}
          />
        </View>
      </ScrollView>

      {/* Pop up Input Lahan Baru */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            paddingHorizontal: scale(20),
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            onPress={() => setShowModal(false)}
          />
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: scale(14),
              padding: scale(14),
              gap: scale(10),
            }}
          >
            <Text
              style={{
                fontFamily: "PoppinsBold",
                fontSize: scale(15),
                color: "#1A202C",
              }}
            >
              Input Lahan Baru
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: scale(10),
                minHeight: scale(48),
                paddingHorizontal: scale(12),
              }}
            >
              <TextInput
                value={namaBaru}
                onChangeText={setNamaBaru}
                autoFocus
                placeholder="Contoh : Lahan 1"
                placeholderTextColor="#6B7280"
                returnKeyType="done"
                onSubmitEditing={handleTambah}
                underlineColorAndroid="transparent"
                style={{
                  flex: 1,
                  height: scale(46),
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                  fontFamily: "PoppinsItalic",
                  fontSize: scale(12),
                  color: "#1A202C",
                }}
              />
              <SquarePen size={scale(20)} color="#1B5E20" />
            </View>
            <Pressable onPress={handleTambah}>
              <LinearGradient
                colors={GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: scale(8),
                  paddingVertical: scale(10),
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "PoppinsBold",
                    fontSize: scale(14),
                  }}
                >
                  Tambah
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
