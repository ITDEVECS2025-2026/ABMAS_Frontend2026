// interfaces/index.ts

export interface SoilData {
  N: number;
  P: number;
  K: number;
  EC: number;
  pH: number;
}

export interface SensorStatus {
  battery: number;
  batteryHealth: string;
  loraStatus: string;
  gps: string;
}

export interface SensorLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface FertilizationRecord {
  id: string;
  date: number;
  type: string;
  amount: number;
  note?: string;
}

export interface FertilizerInput {
  type: string;
  amount: number;
  note?: string;
}

export interface AppSettings {
  debugMode: boolean;
  connectionTopic: string;
  farmerName: string;
  darkMode: boolean;
}

export interface Sensor {
  id: string;
  name: string;
  soilData: SoilData;
  status: SensorStatus;
  location: SensorLocation | null;
  lastUpdated: number;
  fertilizationHistory: FertilizationRecord[];
}   