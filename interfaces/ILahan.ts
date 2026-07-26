// interfaces/ILahan.ts
export type Tanaman = 'PADI' | 'JAGUNG';

export interface Lokasi {
  provinsi: string;
  kota: string;
  kecamatan: string;
  alamat: string;
  lat?: number;
  lon?: number;
}

export interface Lahan {
  id: string;
  namaLahan: string;
  tanaman: Tanaman;
  tanggalTanam: string;
  luasLahan: number;
  targetPanen: number;
  lokasi: Lokasi;
}