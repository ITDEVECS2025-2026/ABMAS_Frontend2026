
import { API_URL } from "./config";
import { Sensor } from "../interfaces";
import { mapNode } from "../utils/mapPayload";

export interface NodePayload {
  id: number; // ID recording dari database server
  nodeId: number; // ID perangkat sensor
  createdAt: string;
  n: number;
  p: number;
  k: number;
  ec: number;
  ph: number;
  t: number;
  h: number;
  la: number;
  lo: number;
  bt: number;
  vb: number;
  rssi: number;
  st: number;
}

export async function fetchInitialSensors(): Promise<Sensor[]> {
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;

  try {
    const response = await fetch(`${API_URL}/telemetry`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SECRET_KEY || "",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `HTTP Error: ${response.status} ${response.statusText}. ${errorBody}`
      );
    }

    const nodes: NodePayload[] = await response.json();

    // Debug: periksa struktur respons dari backend.
    console.log(
      "[DEBUG] Data telemetry mentah:",
      JSON.stringify(nodes, null, 2)
    );

    console.log(
      "[DEBUG] ID recording dan node:",
      nodes.map((node) => ({
        id: node.id,
        nodeId: node.nodeId,
        createdAt: node.createdAt,
      }))
    );

    return nodes.map((node) => {
      const mappedSensor = mapNode(
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
      );

      return {
        ...mappedSensor,
        // ID recording berbeda dari ID perangkat sensor.
        lastReadingId: node.id,
      };
    });
  } catch (error) {
    console.error("[API Fetch Error]:", error);
    throw error;
  }
}

export interface HarvestPayload {
  namaLahan: string;
  tanaman: string;
  tanggalTanam: string;
  luasLahan: number;
  targetPanen: number;
  hasilPanenAktual: number;
  rentangSensor: {
    sensorIdAwal: string;
    sensorIdAkhir: string;
  };
}

export async function saveHarvestData(payload: HarvestPayload) {
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;

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

    throw new Error(
      `HTTP Error ${response.status}: ${errorBody}`
    );
  }

  console.log("Berhasil mengirim data panen");
}

export async function fetchTelemetryPayload() {
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;

  const response = await fetch(`${API_URL}/telemetry`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SECRET_KEY || "",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const payload = await response.json();

  console.log(
    "[TELEMETRY RAW DARI SERVER]",
    JSON.stringify(payload, null, 2)
  );

  return payload;
}