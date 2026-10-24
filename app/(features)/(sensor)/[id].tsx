//(feature)/(sensor)/[id].tsx
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
import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
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
import { averageSensorReadings } from '@/utils/averageReadings';
import type { RecordingPayload } from "@/lib/recordingService";


// GANTI PATH INI SESUAI LOKASI FILE ZUSTAND ANDA:
import { useRecordingStore, type RecordedSnapshot } from "@/store/recordingStore";

const CARD_WIDTH = 336;

type AmbilDataState = "idle" | "confirm" | "loading" | "success" | "error";
type Phase = "ambil" | "kirim";

// Generator Peta HTML OpenStreetMap (Leaflet)
// Generator Peta HTML OpenStreetMap (Leaflet) yang 100% Gratis Tanpa API Key
const generateMapHTML = (lat: number, lon: number) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; background-color: transparent; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false
        }).setView([${lat}, ${lon}], 15);

        // Ganti ke OpenStreetMap standar agar tulisan API Key hilang
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        });
        L.marker([${lat}, ${lon}], {icon: icon}).addTo(map);
      </script>
    </body>
  </html>
`;

export default function SensorDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const idLahan = params.idLahan ? String(params.idLahan) : null;
  const router = useRouter();
  const recordings = useRecordingStore((state) => state.recordings ?? []);

  const saveSnapshot = useRecordingStore((state) => state.saveSnapshot);
  const markSubmitted = useRecordingStore((state) => state.markSubmitted);

  const existingRecording = recordings.find(
    (recording) =>
      String(recording.id_lahan) === String(idLahan) &&
      String(recording.device_id) === String(id)
  );

  const { getSensorById } = useSensorStore();
  const getLahanById = useLahanStore((state) => state.getLahanById);

  const storeSensor = getSensorById(id);
  const lahan = idLahan ? getLahanById(idLahan) : undefined;

  const [refreshedSensor, setRefreshedSensor] = useState<Sensor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const sensor: Sensor | undefined =
    refreshedSensor && refreshedSensor.lastUpdated > (storeSensor?.lastUpdated ?? 0)
      ? {
        ...refreshedSensor,
        lastReadingId: refreshedSensor.lastReadingId ?? storeSensor?.lastReadingId,
      }
      : storeSensor;

  const [ambilDataState, setAmbilDataState] =
    useState<AmbilDataState>("idle");

  const [phase, setPhase] = useState<Phase>("ambil");

  const [idRecording, setIdRecording] = useState<number[]>(
    existingRecording?.id_recording ??
    (existingRecording?.snapshots ?? []).map((_, index) => index)
  );

  const [errorMessage, setErrorMessage] = useState("");

  const lastRecordedTimestampRef = useRef<number | null>(null);

  const snapshotsRef = useRef<RecordedSnapshot[]>(
    existingRecording?.snapshots ?? []
  );

  const savedLocalIdRef = useRef<string | null>(
    existingRecording?.localId ?? null
  );

  useEffect(() => {
    if (!existingRecording) return;

    // Pulihkan semua rekaman sebelumnya untuk lahan dan sensor ini.
    snapshotsRef.current = existingRecording.snapshots ?? [];

    setIdRecording(
      existingRecording.id_recording ??
      (existingRecording.snapshots ?? []).map((_, index) => index)
    );

    savedLocalIdRef.current = existingRecording.localId;
  }, [existingRecording]);

  if (!sensor) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <ScreenHeader title="Sensor" />
        <Text style={{ textAlign: "center", marginTop: 40, fontFamily: "PoppinsMedium" }}>
          Sensor tidak ditemukan
        </Text>
      </View>
    );
  }

  const hasLocation =
    !!sensor.location && sensor.location.latitude !== 0 && sensor.location.longitude !== 0;

  const hasDataTaken = idRecording.length > 0;

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

  async function handleAmbilData() {
    setPhase("ambil");
    setAmbilDataState("loading");
    setErrorMessage("");

    try {
      // Beri jeda untuk menampilkan status loading
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Cegah pembacaan sensor yang sama direkam berulang kali
      if (lastRecordedTimestampRef.current === sensor.lastUpdated) {
        setErrorMessage(
          "Belum ada pembaruan data baru dari sensor. Tunggu beberapa saat."
        );
        setAmbilDataState("error");
        return;
      }

      // Pastikan data sensor tersedia
      const soilData = (sensor as any).soilData;

      if (!soilData) {
        setErrorMessage("Data sensor belum tersedia. Silakan coba kembali.");
        setAmbilDataState("error");
        return;
      }

      // Buat snapshot dengan struktur yang sesuai dengan RecordedSnapshot
      const snapshot: RecordedSnapshot = {
        takenAt: new Date().toISOString(),
        N: Number(soilData.N ?? 0),
        P: Number(soilData.P ?? 0),
        K: Number(soilData.K ?? 0),
        EC: Number(soilData.EC ?? 0),
        pH: Number(soilData.pH ?? 0),
        temperature: Number(
          soilData.temperature ?? soilData.suhu ?? 0
        ),
        humidity: Number(
          soilData.humidity ?? soilData.kelembapan ?? 0
        ),
      };

      // Pastikan nilai yang akan disimpan valid
      const sensorValues = [
        snapshot.N,
        snapshot.P,
        snapshot.K,
        snapshot.EC,
        snapshot.pH,
        snapshot.temperature,
        snapshot.humidity,
      ];

      if (!sensorValues.every((value) => Number.isFinite(value))) {
        setErrorMessage("Data sensor tidak valid. Silakan ambil data kembali.");
        setAmbilDataState("error");
        return;
      }

      // Nomor pembacaan berikutnya
      const nextId = idRecording.length;

      // Simpan ID pembacaan ke state halaman
      setIdRecording((prev) => [...prev, nextId]);

      // Simpan snapshot ke ref agar dapat digunakan untuk menghitung rata-rata
      snapshotsRef.current.push(snapshot);

      /*
       * Simpan snapshot langsung ke Zustand.
       * Data tidak perlu menunggu pengguna menekan tombol Selesai
       * atau melakukan rekomendasi pupuk.
       *
       * Pastikan idLahan, id, dan payload sesuai dengan variabel
       * yang digunakan pada halaman sensor kamu.
       */
      const lahanId = Number(idLahan);

      if (!Number.isFinite(lahanId) || lahanId <= 0) {
        // Kembalikan perubahan lokal jika identitas lahan tidak valid.
        snapshotsRef.current.pop();
        setIdRecording((prev) => prev.slice(0, -1));

        setErrorMessage("ID lahan tidak valid. Data belum dapat disimpan.");
        setAmbilDataState("error");
        return;
      }

      const lahan = useLahanStore
        .getState()
        .getLahanById(String(idLahan));

      if (!lahan) {
        snapshotsRef.current.pop();
        setIdRecording((prev) => prev.slice(0, -1));

        setErrorMessage("Data lahan tidak ditemukan. Data belum dapat disimpan.");
        setAmbilDataState("error");
        return;
      }

      const recordingPayload: RecordingPayload = {
        id_lahan: lahanId,
        device_id: String(id),
        namaLahan: lahan.namaLahan,
        tanaman: lahan.tanaman,
        tanggalTanam: lahan.tanggalTanam,
        pupuk: lahan.pupuk ?? "",
        luasLahan: Number(lahan.luasLahan),
        targetPanen: Number(lahan.targetPanen),
        id_recording: [...idRecording, nextId],
      };

      // Simpan ke Zustand dan dapatkan ID sesi lokal.
      const localId = useRecordingStore
        .getState()
        .saveSnapshot(recordingPayload, snapshot);

      // Simpan ID sesi agar halaman berikutnya menggunakan sesi yang sama.
      savedLocalIdRef.current = localId;

      // Tandai timestamp setelah snapshot berhasil disimpan.
      lastRecordedTimestampRef.current = sensor.lastUpdated;

      setAmbilDataState("success");
    } catch (error) {
      console.error("Gagal mengambil dan menyimpan data sensor:", error);

      setErrorMessage(
        "Terjadi kesalahan saat mengambil atau menyimpan data sensor."
      );
      setAmbilDataState("error");
    }
  }


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
      const averageReadings = averageSensorReadings(snapshotsRef.current);
      console.log("📊 Rata-rata pembacaan sensor:", averageReadings);

      const apiPayload = {
        id_lahan: idLahanAngka,
        device_id: id,
        namaLahan: lahan.namaLahan,
        tanaman: lahan.tanaman,
        tanggalTanam: lahan.tanggalTanam,
        pupuk: lahan.pupuk ?? "",
        luasLahan: lahan.luasLahan,
        targetPanen: lahan.targetPanen,
        id_recording: idRecording,
      };

      const localPayload = {
        ...apiPayload,
        averageSensor: averageReadings,
      };

      await sendRecording(apiPayload);
      const localId = savedLocalIdRef.current;

      if (!localId) {
        throw new Error("Sesi rekaman lokal tidak ditemukan.");
      }

      markSubmitted(localId);
      savedLocalIdRef.current = localId;
      console.log("✅ Berhasil simpan ke Zustand & API. LocalId:", localId);

      setAmbilDataState("success");
    } catch (error) {
      console.error("Gagal mengirim data rekaman:", error);
      setErrorMessage("Gagal mengirim data ke server. Coba lagi.");
      setAmbilDataState("error");
    }
  }

  function closeModal() {
    const berhasilKirim = phase === "kirim" && ambilDataState === "success";
    setAmbilDataState("idle");

    if (berhasilKirim && savedLocalIdRef.current) {
      const finalLocalId = savedLocalIdRef.current;

      savedLocalIdRef.current = null;
      snapshotsRef.current = [];
      setIdRecording([]);
      lastRecordedTimestampRef.current = null;

      router.replace({
        pathname: "/(features)/(rekomendasi)",
        params: { localId: finalLocalId }
      });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
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
                  backgroundColor: "#f0f0f0", // Tambahan background abu-abu saat WebView loading
                }}
              >
                <WebView
                  originWhitelist={['*']}
                  source={{ html: generateMapHTML(sensor.location!.latitude, sensor.location!.longitude) }}
                  style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                  scrollEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                />
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
    </View>
  );
}