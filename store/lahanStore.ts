import { create } from "zustand";

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

export interface LahanState {
  lahanList: Lahan[];
  addLahan: (lahan: Omit<Lahan, "id" | "createdAt">) => void;
  getLahanById: (id: string) => Lahan | undefined;
  
  // TAMBAHAN BARU:
  tempAlamat: string;
  setTempAlamat: (alamat: string) => void;
}

export const useLahanStore = create<LahanState>((set, get) => ({
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
  },

  // Fungsi untuk mengambil detail lahan
  getLahanById: (id) => {
    return get().lahanList.find((l) => l.id === id);
  },
}));

