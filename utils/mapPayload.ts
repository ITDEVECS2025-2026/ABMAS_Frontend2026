import { Sensor, SensorLocation } from '../interfaces';

// Per-node fields broadcast by the backend (see SensorPayloadDto on the server).
export interface NodeReading {
  id: string;
  n?: number; p?: number; k?: number;
  ec?: number; ph?: number;
  t?: number; h?: number;        // ← tambah
  la?: number; lo?: number;
  vb?: number; bt?: number;
  st: number;
  er?: number; rssi?: number;
}

// Shape emitted on the 'sensor:update' event over the /live namespace.
export interface SensorUpdatePayload {
  event: string;
  data: {
    groupId: string;
    ts: number;
    nodes: (NodeReading & { id: number })[];
  };
}

function batteryHealth(pct: number): string {
  if (pct >= 60) return 'Good';
  if (pct >= 30) return 'Fair';
  return 'Low';
}

function toLocation(node: NodeReading, ts: number): SensorLocation | null {
  if (typeof node.la !== 'number' || typeof node.lo !== 'number') return null;
  return { latitude: node.la, longitude: node.lo, timestamp: ts };
}

// Map one node (main or sub) onto the Sensor shape the screens already consume.
export function mapNode(node: NodeReading, ts: number, kind: 'Main' | 'Sub'): Sensor {
  const battery = node.bt ?? 0;
  const hasGps = typeof node.la === 'number' && typeof node.lo === 'number'
    && node.la !== 0 && node.lo !== 0;

  return {
    id: node.id,
    name: `Sensor ${parseInt(node.id) + 1}`,
    soilData: {
      N: node.n ?? 0,
      P: node.p ?? 0,
      K: node.k ?? 0,
      EC: node.ec ?? 0,
      pH: node.ph ?? 0,
      temperature: node.t ?? 0,   // ← tambah
      humidity: node.h ?? 0,      // ← tambah
    },
    status: {
      battery,
      batteryHealth: batteryHealth(battery),
      loraStatus: node.st === 0 ? 'Disconnected' : 'Connected',
      gps: hasGps ? 'Active' : 'No Fix',
      voltage: node.vb ?? 0,      // ← tambah
      rssi: node.rssi ?? 0,       // ← tambah
      statusCode: node.st ?? 0,   // ← tambah
    },
    location: hasGps ? toLocation(node, ts) : null,
    lastUpdated: ts,
    fertilizationHistory: [],
  };
}

// Map a full live payload (main + every sub-node) into a flat Sensor[].
export function mapPayload(payload: SensorUpdatePayload): Sensor[] {
  const ts = payload.data.ts * 1000;
  return payload.data.nodes.map((node) =>
    mapNode(
      { ...node, id: String(node.id) },
      ts,
      node.id === 0 ? 'Main' : 'Sub'
    )
  );
}


