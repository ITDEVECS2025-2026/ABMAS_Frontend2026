import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RekomendasiMetadata = {
  idLahan?: string;
  localId?: string;
  deviceId?: string;
  idRecording?: string | number | number[];
  namaLahan?: string;
  tanaman?: string;
  jenisPupuk?: string;
  rasioNPK?: string;
  luasLahan?: number;
  targetPanen?: number;
  tanggalTanam?: string;
  averageSensor?: any;
  savedAt?: string;
};

export type SavedRecommendation = {
  deviceId: string;
  hasil: any;
  metadata: RekomendasiMetadata;
};

type RekomendasiState = {
  // Tetap disediakan untuk kompatibilitas dengan pemanggilan lama berbasis deviceId.
  rekomendasi: Record<string, any>;
  // Data lengkap yang dapat dicari berdasarkan id lahan.
  rekomendasiByLahan: Record<string, SavedRecommendation>;
  // Data lengkap berdasarkan deviceId, untuk kompatibilitas dan pencarian cadangan.
  rekomendasiByDevice: Record<string, SavedRecommendation>;
  setRekomendasi: (
    deviceId: string,
    hasil: any,
    metadata?: RekomendasiMetadata
  ) => void;
  getRekomendasiByLahanId: (idLahan: string | number) => SavedRecommendation | undefined;
  getRekomendasiByDeviceId: (deviceId: string | number) => SavedRecommendation | undefined;
  hapusRekomendasiLahan: (idLahan: string | number) => void;
};

export const useRekomendasiStore = create<RekomendasiState>()(
  persist(
    (set, get) => ({
      rekomendasi: {},
      rekomendasiByLahan: {},
      rekomendasiByDevice: {},

      setRekomendasi: (deviceId, hasil, metadata = {}) => {
        const normalizedDeviceId = String(deviceId);
        const normalizedMetadata = {
          ...metadata,
          deviceId: metadata.deviceId ?? normalizedDeviceId,
          savedAt: metadata.savedAt ?? new Date().toISOString(),
        };

        const saved: SavedRecommendation = {
          deviceId: normalizedDeviceId,
          hasil,
          metadata: normalizedMetadata,
        };

        set((state) => ({
          rekomendasi: {
            ...state.rekomendasi,
            [normalizedDeviceId]: hasil,
          },
          rekomendasiByDevice: {
            ...state.rekomendasiByDevice,
            [normalizedDeviceId]: saved,
          },
          ...(normalizedMetadata.idLahan
            ? {
                rekomendasiByLahan: {
                  ...state.rekomendasiByLahan,
                  [String(normalizedMetadata.idLahan)]: saved,
                },
              }
            : {}),
        }));
      },

      getRekomendasiByLahanId: (idLahan) =>
        get().rekomendasiByLahan[String(idLahan)],

      getRekomendasiByDeviceId: (deviceId) =>
        get().rekomendasiByDevice[String(deviceId)],

      hapusRekomendasiLahan: (idLahan) =>
        set((state) => {
          const next = { ...state.rekomendasiByLahan };
          delete next[String(idLahan)];
          return { rekomendasiByLahan: next };
        }),
    }),
    {
      name: "rekomendasi-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,

      // Menangani state lama dari versi sebelumnya agar tidak gagal saat hydration.
      // Data yang masih valid dipertahankan; field yang belum ada diberi default.
      migrate: (persistedState: unknown, _persistedVersion: number) => {
        const oldState =
          persistedState && typeof persistedState === "object"
            ? (persistedState as Record<string, unknown>)
            : {};

        const rekomendasi =
          oldState.rekomendasi &&
          typeof oldState.rekomendasi === "object" &&
          !Array.isArray(oldState.rekomendasi)
            ? (oldState.rekomendasi as Record<string, unknown>)
            : {};

        const rekomendasiByLahan =
          oldState.rekomendasiByLahan &&
          typeof oldState.rekomendasiByLahan === "object" &&
          !Array.isArray(oldState.rekomendasiByLahan)
            ? (oldState.rekomendasiByLahan as Record<string, SavedRecommendation>)
            : {};

        const rekomendasiByDevice =
          oldState.rekomendasiByDevice &&
          typeof oldState.rekomendasiByDevice === "object" &&
          !Array.isArray(oldState.rekomendasiByDevice)
            ? (oldState.rekomendasiByDevice as Record<string, SavedRecommendation>)
            : {};

        // Konversi data rekomendasi lama berbasis deviceId ke struktur baru,
        // tanpa menghapus hasil rekomendasi yang sudah tersimpan.
        for (const [deviceId, hasil] of Object.entries(rekomendasi)) {
          if (!rekomendasiByDevice[deviceId]) {
            rekomendasiByDevice[deviceId] = {
              deviceId,
              hasil,
              metadata: { deviceId },
            };
          }
        }

        return {
          ...oldState,
          rekomendasi,
          rekomendasiByLahan,
          rekomendasiByDevice,
        };
      },
    }
  )
);
