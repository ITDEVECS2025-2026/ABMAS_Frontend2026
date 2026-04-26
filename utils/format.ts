export function getSoilStatus(key: string, value: number): 'low' | 'normal' | 'high' {
  const ranges: Record<string, { low: number; high: number }> = {
    N: { low: 30, high: 90 },
    P: { low: 20, high: 70 },
    K: { low: 40, high: 100 },
    EC: { low: 0.8, high: 2.0 },
    pH: { low: 5.5, high: 7.5 },
  };
  const range = ranges[key];
  if (!range) return 'normal';
  if (value < range.low) return 'low';
  if (value > range.high) return 'high';
  return 'normal';
}

export function getSoilUnit(key: string): string {
  const units: Record<string, string> = {
    N: 'mg/kg',
    P: 'mg/kg',
    K: 'mg/kg',
    EC: 'mS/cm',
    pH: '',
  };
  return units[key] ?? '';
}