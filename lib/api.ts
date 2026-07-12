import { API_URL } from './config';
import { Sensor } from '../interfaces';
import { mapNode } from '../utils/mapPayload';

interface NodePayload {
  id: number;
  n: number; p: number; k: number;
  ec: number; ph: number;
  t: number; h: number;
  la: number; lo: number;
  bt: number; vb: number;
  rssi: number; st: number;
}

interface TelemetryResponse {
  event: string;
  data: {
    groupId: string;
    ts: number;
    nodes: NodePayload[];
  };
}

export async function fetchInitialSensors(): Promise<Sensor[]> {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`GET failed -> ${res.status}`);
  }

  const nodes = await res.json();

  console.log("DATA:", nodes);

  return nodes.map((node: any) =>
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
}

// lib/api.ts

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; 
const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const fetchWithAuth = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Menggabungkan header default, secret key, dan custom header jika ada
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': SECRET_KEY || '',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Menangkap error jika status code bukan 2xx (misal: 401 Unauthorized)
    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data as T;
  } catch (error) {
    console.error(`[API Fetch Error] di endpoint ${endpoint}:`, error);
    throw error;
  }
};
