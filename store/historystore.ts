import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type JenisPupuk = "tunggal" | "majemuk";

export type DataPanen = {
  tanggal: string;
  hasil: number;
};

export type HistoryEntry = {
  tanggalMulai: string;
  jenisPupuk: JenisPupuk;
  rasioNPK?: string;
  panen?: DataPanen;
};

type HistoryState = {
  entries: Record<string, HistoryEntry>;
  panenByLahan: Record<string, DataPanen>;
  setRekomendasiInput: (
    idLahan: string,
    entry: Omit<HistoryEntry, "panen">
  ) => void;
  setPanen: (idLahan: string, hasil: number) => void;
  reset: (idLahan: string) => void;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: {},
      panenByLahan: {},

      setRekomendasiInput: (idLahan, entry) =>
        set((state) => ({
          entries: {
            ...state.entries,
            [String(idLahan)]: {
              ...entry,
              // Jangan hilangkan data panen saat input rekomendasi diperbarui.
              panen: state.entries[String(idLahan)]?.panen,
            },
          },
        })),

      setPanen: (idLahan, hasil) =>
        set((state) => {
          const key = String(idLahan);
          const dataPanen: DataPanen = {
            tanggal: new Date().toISOString(),
            hasil,
          };
          const current = state.entries[key];

          return {
            panenByLahan: {
              ...state.panenByLahan,
              [key]: dataPanen,
            },
            entries: current
              ? {
                  ...state.entries,
                  [key]: { ...current, panen: dataPanen },
                }
              : state.entries,
          };
        }),

      reset: (idLahan) =>
        set((state) => {
          const key = String(idLahan);
          const { [key]: removedEntry, ...entries } = state.entries;
          const { [key]: removedPanen, ...panenByLahan } = state.panenByLahan;
          return { entries, panenByLahan };
        }),
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
