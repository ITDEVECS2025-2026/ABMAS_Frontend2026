import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecordingPayload } from "@/lib/recordingService";

export interface RecordedSession extends RecordingPayload {
  localId: string;
  recordedAt: string;
}

interface RecordingState {
  recordings: RecordedSession[];
  addRecording: (payload: RecordingPayload) => void;
  clearRecordings: () => void;
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set) => ({
      recordings: [],

      addRecording: (payload) =>
        set((state) => ({
          recordings: [
            {
              ...payload,
              localId: `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              recordedAt: new Date().toISOString(),
            },
            ...state.recordings,
          ],
        })),

      clearRecordings: () => set({ recordings: [] }),
    }),
    {
      name: "recording-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
