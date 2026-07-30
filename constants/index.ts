// constants/index.ts

export const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#66BB6A',
  primaryDark: '#1B5E20',
  accent: '#81C784',
  accentLight: '#A5D6A7',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceLight: '#E8F5E9',
  card: '#C8E6C9',
  text: '#1A1A1A',
  textSecondary: '#1B5E20',
  textMuted: '#888888',
  success: '#2E7D32',
  warning: '#FF9800',
  danger: '#E53935',
  border: '#2E7D32',
  white: '#FFFFFF',
  black: '#000000',

  // --- TAMBAHAN: dipetakan ke palette di atas, dipakai oleh
  // ScreenHeader, monitoring.tsx, sensor.tsx, AddLahanCard, SensorMetricCard ---
  headerFrom: '#1B5E20',      // = primaryDark
  headerTo: '#2E7D32',        // = primary
  sensorButton: '#2E7D32',    // = primary (tombol Sensor 1-5 & Tambah Lahan)
  sensorButtonPressed: '#1B5E20', // = primaryDark

  metricDark: '#1B5E20',       // = primaryDark  (card N, P, K)
  metricDarkText: '#FFFFFF',   // = white

  metricMedium: '#81C784',     // = accent       (card EC, pH)
  metricMediumText: '#1A1A1A', // = text

  metricLight: '#A5D6A7',      // = accentLight  (card Suhu, Kelembaban)
  metricLightText: '#1A1A1A',  // = text
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

// --- TAMBAHAN: belum ada di file kamu, dipakai monitoring.tsx & sensor.tsx ---
export const ROUTES = {
  HOME: "/(main)",
  HISTORY: "/(main)/history",
  MONITORING: "/(main)/monitoring",
  SENSOR_DETAIL: (id: string) => `/(main)/sensor?id=${id}`,
  LAHAN_BARU: "/(main)/lahan",
} as const;