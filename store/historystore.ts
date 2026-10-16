import { create } from "zustand";

export type JenisPupuk = "tunggal" | "majemuk";

export type HistoryEntry = {
  tanggalMulai: string;
  jenisPupuk: JenisPupuk;
  rasioNPK?: string;
  panen?: {
    tanggal: string;
    hasil: number;
  };
};

type HistoryState = {
  entries: Record<string, HistoryEntry>;
  setRekomendasiInput: (
    idLahan: string,
    entry: Omit<HistoryEntry, "panen">
  ) => void;
  setPanen: (idLahan: string, hasil: number) => void;
  reset: (idLahan: string) => void;
};

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: {},

  setRekomendasiInput: (idLahan, entry) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [idLahan]: entry,
      },
    })),

  setPanen: (idLahan, hasil) =>
    set((state) => {
      const current = state.entries[idLahan];

      if (!current) return state;

      return {
        entries: {
          ...state.entries,
          [idLahan]: {
            ...current,
            panen: {
              tanggal: new Date().toISOString(),
              hasil,
            },
          },
        },
      };
    }),

  reset: (idLahan) =>
    set((state) => {
      const { [idLahan]: removed, ...rest } = state.entries;
      return { entries: rest };
    }),
}));