
//(store)/recordingService
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
  console.log("PAYLOAD /record:", JSON.stringify(payload, null, 2));

  const response = await fetch(`${API_URL}/record`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("DETAIL ERROR DARI SERVER:", errorBody);

    throw new Error(
      `HTTP Error ${response.status}: ${errorBody}`
    );
  }

  const text = await response.text();

  console.log("RESPONS /record:", text);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
