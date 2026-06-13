import { API_URL } from './config';
import { Sensor } from '../interfaces';
import { mapNode, NodeReading } from '../utils/mapPayload';

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// A persisted DB row: same numeric fields as a live reading, but keyed by `nodeId`
// (not `id`) and carrying a `ts` string.
type Row = Omit<NodeReading, 'id'> & { nodeId: string; ts: string };

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// Rows arrive newest-first (ts desc), so the first row seen for a nodeId is its
// latest reading. Collapse the history down to one Sensor per node.
function latestPerNode(rows: Row[], kind: 'Main' | 'Sub'): Sensor[] {
  const seen = new Set<string>();
  const out: Sensor[] = [];
  for (const row of rows) {
    if (seen.has(row.nodeId)) continue;
    seen.add(row.nodeId);
    const ts = Date.parse(row.ts) || Date.now();
    out.push(mapNode({ ...row, id: row.nodeId }, ts, kind));
  }
  return out;
}

// One-shot backfill of the most recent reading for every known node.
export async function fetchInitialSensors(): Promise<Sensor[]> {
  const [main, subs] = await Promise.all([
    getJSON<Paginated<Row>>('/telemetry?limit=200'),
    getJSON<Paginated<Row>>('/subnodes?limit=200'),
  ]);
  return [
    ...latestPerNode(main.data, 'Main'),
    ...latestPerNode(subs.data, 'Sub'),
  ];
}
