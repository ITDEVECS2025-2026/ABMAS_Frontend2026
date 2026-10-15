import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Camera,
  CheckCircle2,
  Leaf,
  MapPin,
  RefreshCcw,
  XCircle,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import SensorCard from "@/components/sensor/SensorCardGrid";
import StatusSensorCard from "@/components/sensor/StatusSensorCard";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { Sensor } from "@/interfaces";
import { fetchInitialSensors } from "@/lib/api";
import { sendRecording } from "@/lib/recordingService";
import { useLahanStore } from "@/store/lahanStore";
import { useSensorStore } from "@/store/sensorContext";
import { getTimeAgo } from "@/utils/gps";
import { scale } from "@/utils/scale";

const CARD_WIDTH = 336;

type AmbilDataState = "idle" | "confirm" | "loading" | "success" | "error";
type Phase = "ambil" | "kirim";

export default function SensorDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const idLahan = params.idLahan ? String(params.idLahan) : null;
  const router = useRouter();

  const { getSensorById } = useSensorStore();
  const getLahanById = useLahanStore((state) => state.getLahanById);

  const storeSensor = getSensorById(id);
  const lahan = idLahan ? getLahanById(idLahan) : undefined;

  // Data hasil refresh manual dari server
  const [refreshedSensor, setRefreshedSensor] = useState<Sensor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  // Data yang dipakai layar: versi dari refresh dipakai hanya jika lebih baru daripada versi di store
  const sensor: Sensor | undefined =
    refreshedSensor && refreshedSensor.lastUpdated > (storeSensor?.lastUpdated ?? 0)
      ? {
          ...refreshedSensor,
          lastReadingId: refreshedSensor.lastReadingId ?? storeSensor?.lastReadingId,
        }
      : storeSensor;

  const [ambilDataState, setAmbilDataState] = useState<AmbilDataState>("idle");
  const [phase, setPhase] = useState<Phase>("ambil");
  const [idRecording, setIdRecording] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Ref untuk menyimpan timestamp terakhir kali data direkam, agar tidak bisa record data yang sama dua kali
  const lastRecordedTimestampRef = useRef<number | null>(null);

  if (!sensor) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ScreenHeader title="Sensor" />
        <Text style={{ textAlign: "center", marginTop: 40, fontFamily: "PoppinsMedium" }}>
          Sensor tidak ditemukan
        </Text>
      </SafeAreaView>
    );
  }

  const hasLocation =
    !!sensor.location && sensor.location.latitude !== 0 && sensor.location.longitude !== 0;

  const hasDataTaken = idRecording.length > 0;

  // Refresh manual: ambil ulang data sensor dari server
  async function handleRefresh() {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshError("");

    try {
      const list = await fetchInitialSensors();
      const latest = list
        .filter((s) => String(s.id) === String(id))
        .sort((a, b) => b.lastUpdated - a.lastUpdated)[0];

      if (!latest) {
        setRefreshError("Data sensor tidak ditemukan di server.");
        return;
      }

      setRefreshedSensor(latest);
    } catch (error) {
      console.error("Gagal refresh data sensor:", error);
      setRefreshError("Gagal memuat data terbaru. Periksa koneksi.");
    } finally {
      setIsRefreshing(false);
    }
  }

  // Setiap pengambilan data berhasil menambah satu ID berurutan ke array idRecording
  async function handleAmbilData() {
    setPhase("ambil");
    setAmbilDataState("loading");

    try {
      // Simulasi jeda / loading
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // CEK: Mencegah user merekam data yang sama berkali-kali jika sensor belum update
      if (lastRecordedTimestampRef.current === sensor.lastUpdated) {
        setErrorMessage("Belum ada pembaruan data baru dari sensor. Tunggu beberapa saat.");
        setAmbilDataState("error");
        return;
      }

      // ID BERDASARKAN URUTAN PENGAMBILAN (0, 1, 2, ...)
      const nextId = idRecording.length;

      // Simpan ID berurutan ke array
      setIdRecording((prev) => [...prev, nextId]);

      // Tandai bahwa data dengan timestamp ini sudah pernah direkam
      lastRecordedTimestampRef.current = sensor.lastUpdated;

      setAmbilDataState("success");
    } catch (error) {
      setErrorMessage("Sensor tidak merespons. Coba lagi dalam beberapa saat.");
      setAmbilDataState("error");
    }
  }

  // Tombol Selesai: seluruh array idRecording dikirim ke server dalam satu permintaan
  // Tombol Selesai: seluruh array idRecording dikirim ke server dalam satu permintaan
async function handleKirim() {
  if (!hasDataTaken) return;

  setPhase("kirim");

  if (!lahan || !idLahan) {
    setErrorMessage("Data lahan tidak ditemukan.");
    setAmbilDataState("error");
    return;
  }

  const idLahanAngka = Number(idLahan);
  if (!Number.isInteger(idLahanAngka)) {
    setErrorMessage("ID lahan tidak valid. Buat ulang data lahan.");
    setAmbilDataState("error");
    return;
  }

  setAmbilDataState("loading");

  try {
    await sendRecording({
      id_lahan: idLahanAngka,
      device_id: id,
      namaLahan: lahan.namaLahan,
      tanaman: lahan.tanaman,
      tanggalTanam: lahan.tanggalTanam,
      pupuk: lahan.pupuk ?? "",
      luasLahan: lahan.luasLahan,
      targetPanen: lahan.targetPanen,
      id_recording: idRecording,
    });
    setAmbilDataState("success");
  } catch (error) {
    console.error("Gagal mengirim data rekaman:", error);
    setErrorMessage("Server tidak merespons. Coba lagi.");
    setAmbilDataState("error");
  }
}

  function closeModal() {
    const berhasilKirim = phase === "kirim" && ambilDataState === "success";
    setAmbilDataState("idle");

    if (berhasilKirim) {
      setIdRecording([]);
      lastRecordedTimestampRef.current = null; // Reset anti-spam jika sudah berhasil kirim
      router.back();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader title={sensor.name} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingBottom: scale(40),
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= Kondisi Tanah ================= */}
        <View style={{ width: scale(CARD_WIDTH), marginTop: scale(16), alignItems: "center" }}>
          <View style={{ flexDirection: "row", gap: scale(8) }}>
            <Leaf size={scale(28.254)} color="#232323" />
            <Text
              style={{
                color: "#232323",
                fontFamily: "PoppinsBold",
                fontSize: scale(21.085),
              }}
            >
              Kondisi Tanah
            </Text>
          </View>
          <Text
            style={{
              color: "#232323",
              fontFamily: "PoppinsMedium",
              fontSize: scale(12.651),
              marginTop: scale(-4),
              marginLeft: scale(2),
            }}
          >
            Pembaruan terakhir : {getTimeAgo(sensor.lastUpdated)}
          </Text>
        </View>

        <SensorCard sensorId={sensor.id} />
        
        {/* Tombol Refresh Data */}
        <Pressable
          onPress={handleRefresh}
          disabled={isRefreshing}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: scale(6),
            marginTop: scale(-6),
            marginBottom: scale(10),
            paddingVertical: scale(6),
            paddingHorizontal: scale(14),
            borderRadius: scale(14),
            borderWidth: scale(1.5),
            borderColor: "#105C2E",
            backgroundColor: "#FFFFFF",
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#105C2E" />
          ) : (
            <RefreshCcw size={scale(14)} color="#105C2E" />
          )}
          <Text
            style={{
              color: "#105C2E",
              fontFamily: "PoppinsSemiBold",
              fontSize: scale(12.5),
            }}
          >
            {isRefreshing ? "Memuat..." : "Refresh Data"}
          </Text>
        </Pressable>

        {refreshError ? (
          <Text
            style={{
              color: "#D32F2F",
              fontFamily: "PoppinsMedium",
              fontSize: scale(11.5),
              marginTop: scale(6),
              marginBottom: scale(16),
              textAlign: "center",
            }}
          >
            {refreshError}
          </Text>
        ) : null}

        {/* ================= Ambil Data ================= */}
        <View style={{ alignItems: "center", width: "100%", paddingHorizontal: scale(15) }}>
          <LinearGradient
            colors={["#105C2E", "#8C6A09"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.6, y: 1 }}
            style={{
              width: "100%",
              height: scale(70),
              borderTopLeftRadius: scale(16.868),
              borderTopRightRadius: scale(16.868),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8) }}>
              <Camera size={scale(23)} color="#FFFFFF" style={{ marginTop: scale(-4) }} />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "PoppinsBold",
                  fontSize: scale(21.085),
                }}
              >
                Ambil Data
              </Text>
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "PoppinsMedium",
                fontSize: scale(12.651),
                marginTop: scale(-7),
              }}
            >
              Pembaruan terakhir : {getTimeAgo(sensor.lastUpdated)}
            </Text>
          </LinearGradient>

          <View
            style={{
              width: "100%",
              paddingVertical: scale(15),
              paddingHorizontal: scale(15),
              borderBottomLeftRadius: scale(8.434),
              borderBottomRightRadius: scale(8.434),
              backgroundColor: "#BDEBBB",
              justifyContent: "center",
              alignItems: "center",
              gap: scale(12),
            }}
          >
            <Pressable
              onPress={() => {
                setPhase("ambil");
                setAmbilDataState("confirm");
              }}
              style={{
                width: scale(310),
                height: scale(53.134),
                borderRadius: scale(21.085),
                borderWidth: scale(2.108),
                borderColor: "#1E1E1E",
                backgroundColor: "#FFFFFF",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: scale(8),
              }}
            >
              <Camera size={scale(24.459)} color="#105C2E" />
              <Text
                style={{
                  color: "#105C2E",
                  fontFamily: "PoppinsBold",
                  fontSize: scale(21.085),
                }}
              >
                Ambil Data
              </Text>
            </Pressable>

            {/* Penghitung jumlah pengambilan data */}
            <Text
              style={{
                color: "#105C2E",
                fontFamily: "PoppinsMedium",
                fontSize: scale(12.5),
                marginTop: scale(-4),
              }}
            >
              Sudah ambil data : {idRecording.length} kali
            </Text>

            <Pressable
              onPress={handleKirim}
              disabled={!hasDataTaken}
              style={{
                width: scale(310),
                height: scale(44),
                borderRadius: scale(16),
                backgroundColor: hasDataTaken ? "#105C2E" : "#A9CBAA",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "PoppinsBold",
                  fontSize: scale(16),
                }}
              >
                Selesai
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ================= Status Sensor ================= */}
        <View style={{ marginTop: scale(24) }}>
          <StatusSensorCard
            battery={sensor.status.battery}
            batteryHealth={sensor.status.batteryHealth}
            loraStatus={sensor.status.loraStatus}
            gpsActive={hasLocation}
            lastUpdated={sensor.lastUpdated}
          />
        </View>

        {/* ================= Lokasi Sawah ================= */}
        <View style={{ marginTop: scale(24), marginBottom: scale(20), width: scale(CARD_WIDTH) }}>
          <View
            style={{
              width: "100%",
              borderRadius: scale(6.05),
              borderWidth: scale(0.403),
              borderColor: "#006134",
              backgroundColor: "#FFFFFF",
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
              <MapPin size={scale(20)} color="#FFFFFF" />
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
                paddingVertical: scale(10),
              }}
            >
              <MapPin size={scale(30)} color="#006134" />
              <View style={{ flex: 1 }}>
                {hasLocation ? (
                  <>
                    <Text
                      style={{
                        color: "#1A202C",
                        fontFamily: "PoppinsSemiBold",
                        fontSize: scale(13),
                      }}
                    >
                      {sensor.location!.latitude.toFixed(6)}, {sensor.location!.longitude.toFixed(6)}
                    </Text>
                    <Text
                      style={{
                        color: "#4A5468",
                        fontFamily: "PoppinsMedium",
                        fontStyle: "italic",
                        fontSize: scale(11.5),
                        marginTop: scale(-2),
                      }}
                    >
                      Diperbarui: {getTimeAgo(sensor.location!.timestamp)}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={{
                      color: "#4A5468",
                      fontFamily: "PoppinsRegular",
                      fontStyle: "italic",
                      fontSize: scale(13),
                    }}
                  >
                    Lokasi belum tersedia dari sensor
                  </Text>
                )}
              </View>
            </View>

            {hasLocation && (
              <View
                style={{
                  width: "100%",
                  height: scale(156),
                  borderTopWidth: scale(0.403),
                  borderTopColor: "#006134",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <MapView
                  style={{ width: "100%", height: "100%" }}
                  mapType="none"
                  region={{
                    latitude: sensor.location!.latitude,
                    longitude: sensor.location!.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <UrlTile
                    urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                    maximumZ={19}
                  />
                  <Marker
                    coordinate={{
                      latitude: sensor.location!.latitude,
                      longitude: sensor.location!.longitude,
                    }}
                  />
                </MapView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ================= Modal Ambil Data / Kirim Data ================= */}
      <Modal
        visible={ambilDataState !== "idle"}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
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
              width: scale(300),
              backgroundColor: "#FFFFFF",
              borderRadius: scale(16),
              padding: scale(20),
              alignItems: "center",
            }}
          >
            {ambilDataState === "confirm" && (
              <>
                <Camera size={scale(32)} color="#105C2E" style={{ marginBottom: scale(10) }} />
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    fontSize: scale(17),
                    color: "#1A202C",
                    textAlign: "center",
                    marginBottom: scale(8),
                  }}
                >
                  Ambil Data Sekarang?
                </Text>
                <Text
                  style={{
                    fontFamily: "PoppinsRegular",
                    fontSize: scale(13),
                    color: "#4A5468",
                    textAlign: "center",
                    marginBottom: scale(20),
                  }}
                >
                  Data terbaru akan diambil dan disimpan di perangkat kamu.
                </Text>
                <View style={{ flexDirection: "row", gap: scale(10), width: "100%" }}>
                  <Pressable
                    onPress={closeModal}
                    style={{
                      flex: 1,
                      height: scale(42),
                      borderRadius: scale(10),
                      borderWidth: scale(1.5),
                      borderColor: "#1E1E1E",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(14), color: "#1E1E1E" }}>
                      Batal
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAmbilData}
                    style={{
                      flex: 1,
                      height: scale(42),
                      borderRadius: scale(10),
                      backgroundColor: "#105C2E",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(14), color: "#FFFFFF" }}>
                      Ambil Data
                    </Text>
                  </Pressable>
                </View>
              </>
            )}

            {ambilDataState === "loading" && (
              <>
                <ActivityIndicator size="large" color="#105C2E" style={{ marginBottom: scale(14) }} />
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    fontSize: scale(16),
                    color: "#1A202C",
                    textAlign: "center",
                  }}
                >
                  {phase === "kirim" ? "Mengirim Data..." : "Mengambil Data..."}
                </Text>
                <Text
                  style={{
                    fontFamily: "PoppinsRegular",
                    fontSize: scale(12),
                    color: "#4A5468",
                    textAlign: "center",
                    marginTop: scale(4),
                  }}
                >
                  Mohon tunggu sebentar...
                </Text>
              </>
            )}

            {ambilDataState === "success" && (
              <>
                <CheckCircle2 size={scale(36)} color="#105C2E" style={{ marginBottom: scale(10) }} />
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    fontSize: scale(16),
                    color: "#1A202C",
                    textAlign: "center",
                    marginBottom: scale(4),
                  }}
                >
                  {phase === "kirim" ? "Data Berhasil Dikirim" : "Data Berhasil Diambil"}
                </Text>
                <Text
                  style={{
                    fontFamily: "PoppinsRegular",
                    fontSize: scale(12),
                    color: "#4A5468",
                    textAlign: "center",
                    marginBottom: scale(18),
                  }}
                >
                  {phase === "kirim"
                    ? `${idRecording.length} data rekaman tersimpan di server`
                    : `Data ke-${idRecording.length} berhasil direkam`}
                </Text>
                <Pressable
                  onPress={closeModal}
                  style={{
                    width: "100%",
                    height: scale(42),
                    borderRadius: scale(10),
                    backgroundColor: "#105C2E",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(14), color: "#FFFFFF" }}>
                    Selesai
                  </Text>
                </Pressable>
              </>
            )}

            {ambilDataState === "error" && (
              <>
                <XCircle size={scale(36)} color="#D32F2F" style={{ marginBottom: scale(10) }} />
                <Text
                  style={{
                    fontFamily: "PoppinsBold",
                    fontSize: scale(15),
                    color: "#1A202C",
                    textAlign: "center",
                    marginBottom: scale(4),
                  }}
                >
                  {phase === "kirim" ? "Gagal Mengirim Data" : "Gagal Mengambil Data"}
                </Text>
                <Text
                  style={{
                    fontFamily: "PoppinsRegular",
                    fontSize: scale(12),
                    color: "#4A5468",
                    textAlign: "center",
                    marginBottom: scale(18),
                  }}
                >
                  {errorMessage}
                </Text>
                <View style={{ flexDirection: "row", gap: scale(10), width: "100%" }}>
                  <Pressable
                    onPress={closeModal}
                    style={{
                      flex: 1,
                      height: scale(42),
                      borderRadius: scale(10),
                      borderWidth: scale(1.5),
                      borderColor: "#1E1E1E",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(14), color: "#1E1E1E" }}>
                      Batal
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={phase === "kirim" ? handleKirim : handleAmbilData}
                    style={{
                      flex: 1,
                      height: scale(42),
                      borderRadius: scale(10),
                      backgroundColor: "#105C2E",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: scale(6),
                    }}
                  >
                    <RefreshCcw size={scale(14)} color="#FFFFFF" />
                    <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(14), color: "#FFFFFF" }}>
                      Coba Lagi
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}