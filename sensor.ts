// types/sensor.ts

export type SensorId = string;

export interface SensorSummary {
  id: SensorId;
  name: string;
  lahanNama?: string;
  online: boolean;
}

export interface KondisiTanah {
  n: number;
  p: number;
  k: number;
  ec: number;
  ph: number;
  suhu: number;
  kelembaban: number;
  updatedAt: string;
}

export interface StatusSensor {
  batteryPercent: number;
  batteryHealth: "Baik" | "Cukup" | "Buruk";
  loraStatus: "Aktif" | "Terputus";
  gps: string;
  updatedAt: string;
}

export interface LokasiSawah {
  alamat: string;
  lat: number;
  lng: number;
}

export interface SensorDetail extends SensorSummary {
  kondisiTanah: KondisiTanah;
  statusSensor: StatusSensor;
  lokasi: LokasiSawah;
}

export interface Lahan {
  id: string;
  nama: string;
  createdAt: string;
}

export interface RekomendasiPupuk {
  parameter: keyof Omit<KondisiTanah, "updatedAt">;
  status: "Kurang" | "Cukup" | "Lebih";
  saran: string;
}