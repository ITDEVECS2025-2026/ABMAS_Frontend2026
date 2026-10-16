// app/(features)/(history)/index.tsx  → halaman "History Pemupukan"
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, PlusCircle, Search, SquarePen } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useHistoryStore } from "@/store/historystore";
import { useLahanStore } from "@/store/lahanStore";
import { scale } from "@/utils/scale";


const jagungIcon = require("../../styles/assets/jagung icon.png");
const padiIcon = require("../../styles/assets/padi icon.png");

// ⚠️ SESUAIKAN: path file halaman detail (hasil merge) milikmu
const DETAIL_PATH = "/(features)/(history)/[idLahan]";
// ⚠️ SESUAIKAN: path form "Lahan Baru" milikmu
const FORM_LAHAN_PATH = "/(features)/(lahan)";

const GRADIENT = ["#105C2E", "#8C6A09"] as const;

export default function HistoryPemupukanPage() {
  const router = useRouter();

  // ⚠️ SESUAIKAN: nama field list lahan di lahanStore-mu (di sini diasumsikan `lahanList`)
  const lahanList = useLahanStore((s: any) => s.lahanList ?? s.lahan ?? []) as any[];
  const entries = useHistoryStore((s) => s.entries);

  const [query, setQuery] = useState("");
  const [namaBaru, setNamaBaru] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(
    () => lahanList.filter((l) => (l.namaLahan ?? "").toLowerCase().includes(query.trim().toLowerCase())),
    [lahanList, query]
  );

  const formatTanggal = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

  const handleTambah = () => {
    const nama = namaBaru.trim();
    if (!nama) return;
    setShowModal(false);
    setNamaBaru("");
    router.push({ pathname: FORM_LAHAN_PATH, params: { namaLahan: nama } } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <LinearGradient
        colors={["#1B5E20", "#8A7A0C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingTop: scale(48), paddingBottom: scale(16), alignItems: "center", justifyContent: "center" }}
      >
        <Pressable onPress={() => router.back()} style={{ position: "absolute", left: scale(16), top: scale(50) }}>
          <ArrowLeft color="#FFFFFF" size={scale(24)} />
        </Pressable>
        <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(18) }}>History Pemupukan</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: scale(16), paddingBottom: scale(24) }} showsVerticalScrollIndicator={false}>
        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#EEF2F1",
            borderRadius: scale(8),
            borderWidth: 1,
            borderColor: "#CBD5E1",
            paddingHorizontal: scale(10),
            height: scale(36),
            marginBottom: scale(14),
          }}
        >
          <Search size={scale(16)} color="#64748B" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari Nama Lahan."
            placeholderTextColor="#64748B"
            style={{ flex: 1, marginLeft: scale(8), fontFamily: "PoppinsRegular", fontSize: scale(12), color: "#1A202C" }}
          />
        </View>

        {/* List lahan */}
        <View style={{ gap: scale(10), marginBottom: scale(20) }}>
          {filtered.length === 0 && (
            <Text style={{ textAlign: "center", color: "#64748B", fontFamily: "PoppinsRegular", fontSize: scale(12), marginVertical: scale(16) }}>
              {query ? "Lahan tidak ditemukan." : "Belum ada lahan. Tambahkan lahan pertamamu di bawah."}
            </Text>
          )}

          {filtered.map((lahan) => {
            const id = String(lahan.id);
            const isJagung = lahan.tanaman === "JAGUNG";
            const sudahPanen = !!entries[id]?.panen;
            return (
              <Pressable
                key={id}
                onPress={() => router.push({ pathname: DETAIL_PATH, params: { idLahan: id } } as any)}
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
                <Image source={isJagung ? jagungIcon : padiIcon} style={{ width: scale(34), height: scale(44), resizeMode: "contain" }} />
                <View style={{ flex: 1, marginLeft: scale(10) }}>
                  <Text numberOfLines={1} style={{ fontFamily: "PoppinsBold", fontSize: scale(14), color: "#1A202C" }}>
                    {lahan.namaLahan}
                  </Text>
                  <View style={{ flexDirection: "row", gap: scale(6), marginTop: scale(2) }}>
                    <View style={{ backgroundColor: "#58C15C", borderRadius: scale(4), paddingHorizontal: scale(6), paddingVertical: scale(1) }}>
                      <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(9) }}>
                        {isJagung ? "Tanaman Jagung" : "Tanaman Padi"}
                      </Text>
                    </View>
                    {sudahPanen && (
                      <View style={{ backgroundColor: "#105C2E", borderRadius: scale(4), paddingHorizontal: scale(6), paddingVertical: scale(1) }}>
                        <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsMedium", fontSize: scale(9) }}>Sudah dipanen</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={{ alignSelf: "flex-start", fontFamily: "PoppinsRegular", fontSize: scale(9), color: "#4A5468" }}>
                  {formatTanggal(lahan.tanggalTanam)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Card Tambah Lahan */}
        <LinearGradient colors={["#1B5E20", "#8A7A0C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(16), padding: scale(12) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: scale(6), marginBottom: scale(8) }}>
            <PlusCircle size={scale(18)} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(16) }}>Tambah Lahan</Text>
          </View>
          <Pressable
            onPress={() => setShowModal(true)}
            style={{ backgroundColor: "#FFFFFF", borderRadius: scale(10), height: scale(44), paddingHorizontal: scale(12), flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ flex: 1, fontFamily: "PoppinsItalic", fontSize: scale(12), color: "#6B7280" }}>Contoh : Lahan 1</Text>
            <SquarePen size={scale(22)} color="#1B5E20" />
          </Pressable>
        </LinearGradient>
      </ScrollView>

      {/* Pop up "Input Lahan Baru" */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", paddingHorizontal: scale(20) }}
        >
          <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setShowModal(false)} />
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: scale(14), padding: scale(14), gap: scale(10) }}>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: scale(10), height: scale(44), paddingHorizontal: scale(12) }}>
              <TextInput
                value={namaBaru}
                onChangeText={setNamaBaru}
                autoFocus
                placeholder="Contoh : Lahan 1"
                placeholderTextColor="#6B7280"
                returnKeyType="done"
                onSubmitEditing={handleTambah}
                style={{ flex: 1, fontFamily: "PoppinsItalic", fontSize: scale(12), color: "#1A202C" }}
              />
              <SquarePen size={scale(20)} color="#1B5E20" />
            </View>
            <Pressable onPress={handleTambah}>
              <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: scale(8), paddingVertical: scale(10), alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontFamily: "PoppinsBold", fontSize: scale(14) }}>Tambah</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}