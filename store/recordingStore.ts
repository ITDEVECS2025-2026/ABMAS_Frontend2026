
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecordingPayload } from "@/lib/recordingService";

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
  isSubmitted?: boolean;
}

interface RecordingState {
  recordings: RecordedSession[];

  // Membuat atau memperbarui sesi lokal saat snapshot diambil.
  saveSnapshot: (
    payload: RecordingPayload,
    snapshot: RecordedSnapshot
  ) => string;

  // Menandai sesi yang sama setelah berhasil dikirim ke server.
  markSubmitted: (localId: string) => void;

  addRecording: (
    payload: RecordingPayload,
    snapshots: RecordedSnapshot[]
  ) => string;

  getRecordingById: (localId: string) => RecordedSession | undefined;

  // Menghapus seluruh sesi lokal untuk satu lahan.
  clearRecordingsByLahan: (idLahan: string | number) => void;

  clearRecordings: () => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: [],

      saveSnapshot: (payload, snapshot) => {
        const key = String(payload.id_lahan);

        const existing = get().recordings.find(
          (record) =>
            String(record.id_lahan) === key &&
            record.device_id === payload.device_id &&
            !record.isSubmitted
        );

        if (existing) {
          set((state) => ({
            recordings: state.recordings.map((record) =>
              record.localId === existing.localId
                ? {
                    ...record,
                    ...payload,
                    snapshots: [...record.snapshots, snapshot],
                  }
                : record
            ),
          }));

          return existing.localId;
        }

        const localId = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        set((state) => ({
          recordings: [
            {
              ...payload,
              localId,
              recordedAt: new Date().toISOString(),
              snapshots: [snapshot],
              isSubmitted: false,
            },
            ...state.recordings,
          ],
        }));

        return localId;
      },

      markSubmitted: (localId) =>
        set((state) => ({
          recordings: state.recordings.map((record) =>
            record.localId === localId
              ? { ...record, isSubmitted: true }
              : record
          ),
        })),

      addRecording: (payload, snapshots) => {
        const localId = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        set((state) => ({
          recordings: [
            {
              ...payload,
              localId,
              recordedAt: new Date().toISOString(),
              snapshots,
              isSubmitted: true,
            },
            ...state.recordings,
          ],
        }));

        return localId;
      },

      getRecordingById: (localId) =>
        get().recordings.find((record) => record.localId === localId),

      clearRecordingsByLahan: (idLahan) =>
        set((state) => ({
          recordings: state.recordings.filter(
            (record) => String(record.id_lahan) !== String(idLahan)
          ),
        })),

      clearRecordings: () => set({ recordings: [] }),
    }),
    {
      name: "recording-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
