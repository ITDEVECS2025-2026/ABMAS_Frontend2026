import { API_URL } from "./config";

export interface RecordingPayload {
  id_lahan: number;
  device_id: string;
  namaLahan: string;
  tanaman: "JAGUNG" | "PADI";
  tanggalTanam: string;
  pupuk: string;
  luasLahan: number;
  targetPanen: number;
  id_recording: number[];
} 

function getHeaders() {
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;
  return {
    "Content-Type": "application/json",
    "x-api-key": SECRET_KEY || "",
  };
}

export async function sendRecording(payload: RecordingPayload) {
  const response = await fetch(`${API_URL}/record`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}