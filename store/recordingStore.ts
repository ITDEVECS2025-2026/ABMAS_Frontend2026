import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecordingPayload } from "@/lib/recordingService";

// Satu cuplikan kondisi tanah, diambil setiap tombol Ambil Data berhasil
export interface RecordedSnapshot {
  takenAt: string;
  N: number;
  P: number;
  K: number;
  EC: number;
  pH: number;
  temperature: number;
  humidity: number;
}

export interface RecordedSession extends RecordingPayload {
  localId: string;
  recordedAt: string;
  snapshots: RecordedSnapshot[];
}

interface RecordingState {
  recordings: RecordedSession[];
  addRecording: (payload: RecordingPayload, snapshots: RecordedSnapshot[]) => string;
  getRecordingById: (localId: string) => RecordedSession | undefined;
  clearRecordings: () => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: [],

      // Mengembalikan localId agar halaman rekomendasi dapat membuka sesi yang tepat
      addRecording: (payload, snapshots) => {
        const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        set((state) => ({
          recordings: [
            {
              ...payload,
              localId,
              recordedAt: new Date().toISOString(),
              snapshots,
            },
            ...state.recordings,
          ],
        }));

        return localId;
      },

      getRecordingById: (localId) =>
        get().recordings.find((r) => r.localId === localId),

      clearRecordings: () => set({ recordings: [] }),
    }),
    {
      name: "recording-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);