import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mendefinisikan tipe data Lahan
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
  luasLahan: number;
  targetPanen: number;
  lokasi: LokasiLahan;
  createdAt: string;
}

// TAMBAHAN BARU: rentang ID sensor untuk rekomendasi
export interface RentangSensorId {
  dari: number;
  sampai: number;
}

export interface LahanState {
  lahanList: Lahan[];
  addLahan: (lahan: Omit<Lahan, "id" | "createdAt">) => string; // return id lahan baru
  getLahanById: (id: string) => Lahan | undefined;

  tempAlamat: string;
  setTempAlamat: (alamat: string) => void;

  // TAMBAHAN BARU:
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

      // Fungsi untuk menambah lahan baru dari halaman Lahan Baru
      addLahan: (lahanData) => {
        const newLahan: Lahan = {
          ...lahanData,
          id: `lahan-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          lahanList: [newLahan, ...state.lahanList],
        }));

        return newLahan.id; // supaya screen bisa langsung dapat id-nya
      },

      // Fungsi untuk mengambil detail lahan
      getLahanById: (id) => {
        return get().lahanList.find((l) => l.id === id);
      },

      // TAMBAHAN BARU: simpan rentang ID sensor per lahan
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
      name: "lahan-storage", // key di AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);