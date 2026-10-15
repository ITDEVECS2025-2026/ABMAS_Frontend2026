import { API_URL } from './config';
import { Sensor } from '../interfaces';
import { mapNode } from '../utils/mapPayload';

export interface NodePayload {
  nodeId: number;
  createdAt: string;
  n: number; p: number; k: number;
  ec: number; ph: number;
  t: number; h: number;
  la: number; lo: number;
  bt: number; vb: number;
  rssi: number; st: number;
}

export async function fetchInitialSensors(): Promise<Sensor[]> {
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;

  try {
    // 1. Tambahkan /telemetry di sini
    const response = await fetch(`${API_URL}/telemetry`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SECRET_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}${response.statusText}`);
    }

    const nodes: NodePayload[] = await response.json();

    return nodes.map((node) =>
      mapNode(
        {
          id: String(node.nodeId),
          n: node.n,
          p: node.p,
          k: node.k,
          ec: node.ec,
          ph: node.ph,
          t: node.t,
          h: node.h,
          la: node.la,
          lo: node.lo,
          bt: node.bt,
          vb: node.vb,
          rssi: node.rssi,
          st: node.st,
        },
        new Date(node.createdAt).getTime(),
        node.nodeId === 0 ? "Main" : "Sub"
      )
    );
  } catch (error) {
    console.error(`[API Fetch Error]:`, error);
    throw error;
  }
}

export interface HarvestPayload {
  id_lahan: number;
  hasilPanenAktual: number;
  };


export async function saveHarvestData(payload: HarvestPayload) {
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;
  
  // 2. Gunakan API_URL dan tambahkan /record di sini (jangan di-hardcode lagi)
  const response = await fetch(`${API_URL}/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SECRET_KEY || "",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("DETAIL ERROR DARI SERVER:", errorBody);
    throw new Error(`HTTP Error ${response.status}:${errorBody}`);
  }
  
  console.log("Berhasil mengirim data panen");
}