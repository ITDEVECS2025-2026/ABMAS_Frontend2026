import { API_URL} from './config';
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
  //   const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; 
  const SECRET_KEY = process.env.EXPO_PUBLIC_API_KEY;
  console.log("SENDING API KEY:", SECRET_KEY); // Check your Expo terminal for this

  // 1. Prepare your headers
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': SECRET_KEY || '',
  };

  try {
    // 2. Make the fetch request inside the try block
    const response = await fetch(API_URL, {
      method: 'GET',
      headers,
    });

    // 3. Check for HTTP errors immediately before parsing JSON
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // 4. Parse the response as JSON
    const nodes = await response.json();
    console.log("DATA:", nodes);

  // payload mapping
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
catch (error) {
    // 6. Properly catch any network drops or thrown errors here
    console.error(`[API Fetch Error]:`, error);
    throw error;
  }
}
