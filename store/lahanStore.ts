import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface LokasiLahan {
  lat?: number;
  lon?: number;
  alamat: string;
}

export interface Lahan {
  id: string;
  namaLahan: string;
  tanaman: "JAGUNG" | "PADI";
  tanggalTanam: string;
  pupuk: string;
  luasLahan: number;
  targetPanen: number;
  lokasi: LokasiLahan;
  createdAt: string;
}

export interface RentangSensorId {
  dari: number;
  sampai: number;
}

export interface LahanState {
  lahanList: Lahan[];
  addLahan: (lahan: Omit<Lahan, "id" | "createdAt">) => string;
  getLahanById: (id: string) => Lahan | undefined;

  tempAlamat: string;
  setTempAlamat: (alamat: string) => void;

  rentangSensorIdByLahan: Record<string, RentangSensorId>;
  setRentangSensorId: (lahanId: string, rentang: RentangSensorId) => void;
  getRentangSensorId: (lahanId: string) => RentangSensorId | undefined;
}

export const useLahanStore = create<LahanState>()(
  persist(
    (set, get) => ({
      lahanList: [],
      tempAlamat: "",
      setTempAlamat: (alamat) => set({ tempAlamat: alamat }),

      addLahan: (lahanData) => {
        const newLahan: Lahan = {
          ...lahanData,
          // ID berupa angka dalam detik, supaya Number(id) valid dan masih muat di kolom Int 32 bit
          id: String(Math.floor(Date.now() / 1000)),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          lahanList: [newLahan, ...state.lahanList],
        }));

        return newLahan.id;
      },

      getLahanById: (id) => {
        return get().lahanList.find((l) => l.id === id);
      },

      rentangSensorIdByLahan: {},
      setRentangSensorId: (lahanId, rentang) =>
        set((state) => ({
          rentangSensorIdByLahan: {
            ...state.rentangSensorIdByLahan,
            [lahanId]: rentang,
          },
        })),
      getRentangSensorId: (lahanId) => {
        return get().rentangSensorIdByLahan[lahanId];
      },
    }),
    {
      name: "lahan-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);