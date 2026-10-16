
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  PlusCircle,
  Search,
  SquarePen,
} from "lucide-react-native";
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

import BottomNavbar from "@/components/navbar/bottomNavar";
import { useHistoryStore } from "@/store/historystore";
import { useLahanStore } from "@/store/lahanStore";
import { scale } from "@/utils/scale";

const jagungIcon = require("../../../styles/assets/jagung icon.png");
const padiIcon = require("../../../styles/assets/padi icon.png");

const DETAIL_PATH = "/(features)/(history)/[id_lahan]";
const FORM_LAHAN_PATH = "/(features)/(lahan)";
const GRADIENT = ["#105C2E", "#8C6A09"] as const;

export default function HistoryPemupukanPage() {
  const router = useRouter();

  // Membaca data lahan yang sudah disimpan di Zustand + AsyncStorage.
  const lahanList = useLahanStore((state) => state.lahanList);
  const entries = useHistoryStore((state) => state.entries);

  const [query, setQuery] = useState("");
  const [namaBaru, setNamaBaru] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return lahanList.filter((lahan) =>
      (lahan.namaLahan ?? "").toLowerCase().includes(keyword)
    );
  }, [lahanList, query]);

  const formatTanggal = (tanggal?: string) => {
    if (!tanggal) return "-";

    const date = new Date(tanggal);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleTambah = () => {
    const nama = namaBaru.trim();

    if (!nama) {
      return;
    }

    setShowModal(false);
    setNamaBaru("");

    router.push({
      pathname: FORM_LAHAN_PATH,
      params: { namaLahan: nama },
    } as any);
  };

  const handleBukaLahan = (idLahan: string) => {
    router.push({
      pathname: DETAIL_PATH,
      params: { idLahan },
    } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* HEADER */}
      <LinearGradient
        colors={["#1B5E20", "#8A7A0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: scale(48),
          paddingBottom: scale(16),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            position: "absolute",
            left: scale(16),
            top: scale(50),
          }}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <ArrowLeft color="#FFFFFF" size={scale(24)} />
        </Pressable>

        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "PoppinsBold",
            fontSize: scale(18),
          }}
        >
          History Pemupukan
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: scale(16),
          paddingBottom: scale(100),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* PENCARIAN */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#EEF2F1",
            borderRadius: scale(8),
            borderWidth: 1,
            borderColor: "#CBD5E1",
            paddingHorizontal: scale(10),
            height: scale(40),
            marginBottom: scale(14),
          }}
        >
          <Search size={scale(16)} color="#64748B" />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari Nama Lahan..."
            placeholderTextColor="#64748B"
            style={{
              flex: 1,
              marginLeft: scale(8),
              fontFamily: "PoppinsRegular",
              fontSize: scale(12),
              color: "#1A202C",
            }}
          />

          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Text
                style={{
                  color: "#105C2E",
                  fontFamily: "PoppinsMedium",
                }}
              >
                Hapus
              </Text>
            </Pressable>
          )}
        </View>

        {/* DAFTAR LAHAN TERSIMPAN */}
        <View
          style={{
            gap: scale(10),
            marginBottom: scale(20),
          }}
        >
          {filtered.length === 0 && (
            <View
              style={{
                alignItems: "center",
                paddingVertical: scale(28),
                paddingHorizontal: scale(12),
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#64748B",
                  fontFamily: "PoppinsRegular",
                  fontSize: scale(12),
                  lineHeight: scale(20),
                }}
              >
                {query.trim()
                  ? "Lahan tidak ditemukan. Coba kata kunci lain."
                  : "Belum ada lahan tersimpan. Tambahkan lahan terlebih dahulu."}
              </Text>
            </View>
          )}

          {filtered.map((lahan) => {
            const id = String(lahan.id);
            const isJagung = lahan.tanaman === "JAGUNG";
            const sudahPanen = Boolean(entries[id]?.panen);

            return (
              <Pressable
                key={id}
                onPress={() => handleBukaLahan(id)}
                accessibilityRole="button"
                accessibilityLabel={`Buka detail ${lahan.namaLahan}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#B7E4B9",
                  borderRadius: scale(10),
                  padding: scale(10),
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Image
                  source={isJagung ? jagungIcon : padiIcon}
                  style={{
                    width: scale(38),
                    height: scale(48),
                    resizeMode: "contain",
                  }}
                />

                <View
                  style={{
                    flex: 1,
                    minWidth: 0,
                    marginLeft: scale(10),
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "PoppinsBold",
                      fontSize: scale(14),
                      color: "#1A202C",
                    }}
                  >
                    {lahan.namaLahan}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: scale(5),
                      marginTop: scale(3),
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#58C15C",
                        borderRadius: scale(4),
                        paddingHorizontal: scale(6),
                        paddingVertical: scale(2),
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "PoppinsMedium",
                          fontSize: scale(9),
                        }}
                      >
                        {isJagung ? "Tanaman Jagung" : "Tanaman Padi"}
                      </Text>
                    </View>

                    {sudahPanen && (
                      <View
                        style={{
                          backgroundColor: "#105C2E",
                          borderRadius: scale(4),
                          paddingHorizontal: scale(6),
                          paddingVertical: scale(2),
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

                  <Text
                    style={{
                      color: "#4A5468",
                      fontFamily: "PoppinsRegular",
                      fontSize: scale(10),
                      marginTop: scale(3),
                    }}
                  >
                    Luas: {lahan.luasLahan} hektar
                  </Text>
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
                  {formatTanggal(lahan.tanggalTanam)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* TAMBAH LAHAN */}
        <LinearGradient
          colors={["#1B5E20", "#8A7A0C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: scale(16),
            padding: scale(12),
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: scale(6),
              marginBottom: scale(8),
            }}
          >
            <PlusCircle size={scale(18)} color="#FFFFFF" />

            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "PoppinsBold",
                fontSize: scale(16),
              }}
            >
              Tambah Lahan
            </Text>
          </View>

          <Pressable
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: scale(10),
              minHeight: scale(44),
              paddingHorizontal: scale(12),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontFamily: "PoppinsItalic",
                fontSize: scale(12),
                color: "#6B7280",
              }}
            >
              Contoh: Lahan 1
            </Text>

            <SquarePen size={scale(22)} color="#1B5E20" />
          </Pressable>
        </LinearGradient>
      </ScrollView>

      {/* NAVBAR */}
      <BottomNavbar active="history" />

      {/* MODAL TAMBAH LAHAN */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                fontSize: scale(16),
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
                minHeight: scale(44),
                paddingHorizontal: scale(12),
              }}
            >
              <TextInput
                value={namaBaru}
                onChangeText={setNamaBaru}
                autoFocus
                placeholder="Contoh: Lahan 1"
                placeholderTextColor="#6B7280"
                returnKeyType="done"
                onSubmitEditing={handleTambah}
                style={{
                  flex: 1,
                  fontFamily: "PoppinsRegular",
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

            <Pressable
              onPress={() => {
                setShowModal(false);
                setNamaBaru("");
              }}
              style={{
                alignItems: "center",
                paddingVertical: scale(8),
              }}
            >
              <Text
                style={{
                  color: "#64748B",
                  fontFamily: "PoppinsMedium",
                  fontSize: scale(12),
                }}
              >
                Batal
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
