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