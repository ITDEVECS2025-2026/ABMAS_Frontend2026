// store/sensorContext.tsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { Sensor, SensorLocation, FertilizerInput, AppSettings } from "../interfaces";
import { fetchInitialSensors } from "../lib/api";
import { createLiveSocket } from "../lib/socket";
import { mapPayload, SensorUpdatePayload } from "../utils/mapPayload";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types & Constants ───────────────────────────────────────────────────────
const SETTINGS_KEY = "APP_SETTINGS";

interface SensorState {
  sensors: Sensor[];
  settings: AppSettings;
  connected: boolean;
}

type Action =
  | { type: "UPSERT_SENSORS"; sensors: Sensor[] }
  | { type: "SET_CONNECTED"; connected: boolean }
  | { type: "UPDATE_LOCATION"; sensorId: string; location: SensorLocation }
  | { type: "ADD_FERTILIZATION"; sensorId: string; input: FertilizerInput }
  | { type: "UPDATE_SETTINGS"; settings: Partial<AppSettings> };

interface SensorContextValue {
  sensors: Sensor[];
  settings: AppSettings;
  connected: boolean;
  updateSensorLocation: (sensorId: string, location: SensorLocation) => void;
  addFertilizationRecord: (sensorId: string, input: FertilizerInput) => void;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  getSensorById: (id: string) => Sensor | undefined;
}

// ─── Initial State ────────────────────────────────────────────────────────────
const DUMMY_SENSORS: Sensor[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(1 + i), // <-- UBAH JADI i + 1
  name: `Sensor ${i + 1}`,
  soilData: { N: 0, P: 0, K: 0, EC: 0, pH: 0, temperature: 0, humidity: 0 },
  status: {
    battery: 0,
    batteryHealth: "-",
    loraStatus: "Menunggu data...",
    gps: "No Fix",
    voltage: 0,
    rssi: 0,
    statusCode: 0,
  },
  location: null,
  fertilizationHistory: [],
  lastUpdated: Date.now(),
}));

const initialState: SensorState = {
  sensors: DUMMY_SENSORS,
  settings: {
    debugMode: false,
    connectionTopic: "abmasoes/petani",
    farmerName: "PRIA SOLO REAL",
    darkMode: true,
  },
  connected: false,
};

function upsertSensors(
  existing: Sensor[],
  incoming: Sensor[]
): Sensor[] {
  const byId = new Map(
    existing.map((sensor) => [String(sensor.id), sensor])
  );

  for (const next of incoming) {
    const id = String(next.id);
    const prev = byId.get(id);

    if (!prev) {
      byId.set(id, next);
      continue;
    }

    byId.set(id, {
      ...prev,
      ...next,

      soilData: {
        ...prev.soilData,
        ...next.soilData,
      },

      status: {
        ...prev.status,
        ...next.status,
      },

      fertilizationHistory:
        prev.fertilizationHistory ?? next.fertilizationHistory,

      location: next.location ?? prev.location ?? null,
    });
  }

  return Array.from(byId.values());
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function sensorReducer(state: SensorState, action: Action): SensorState {
  switch (action.type) {
    case "UPSERT_SENSORS":
      return { ...state, sensors: upsertSensors(state.sensors, action.sensors) };

    case "SET_CONNECTED":
      return { ...state, connected: action.connected };

    case "UPDATE_LOCATION":
      return {
        ...state,
        sensors: state.sensors.map((s) => (s.id === action.sensorId ? { ...s, location: action.location } : s)),
      };

    case "ADD_FERTILIZATION":
      return {
        ...state,
        sensors: state.sensors.map((s) =>
          s.id === action.sensorId
            ? {
              ...s,
              fertilizationHistory: [
                {
                  id: Date.now().toString(),
                  date: Date.now(),
                  ...action.input,
                },
                ...s.fertilizationHistory,
              ],
            }
            : s,
        ),
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const SensorContext = createContext<SensorContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SensorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sensorReducer, initialState);

  // 1. Load settings dari AsyncStorage saat aplikasi pertama kali dibuka
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(SETTINGS_KEY);
        if (saved) {
          dispatch({
            type: "UPDATE_SETTINGS",
            settings: JSON.parse(saved),
          });
        }
      } catch (e) {
        console.error("Gagal memuat pengaturan dari AsyncStorage:", e);
      }
    };

    loadSettings();
  }, []);

  // 2. Sinkronisasi REST API & Live Socket
  // 2. Sinkronisasi REST API & Live Socket
  useEffect(() => {
    let active = true;
    let isFetching = false;

    const refreshSensors = async () => {
      // Hindari request bertumpuk
      if (!active || isFetching) return;

      isFetching = true;

      try {
        const sensors = await fetchInitialSensors();

        if (active && sensors.length > 0) {
          dispatch({
            type: "UPSERT_SENSORS",
            sensors,
          });
        }
      } catch (error) {
        console.warn(
          "[POLLING] Gagal mengambil data sensor:",
          error
        );
      } finally {
        isFetching = false;
      }
    };

    // Request pertama saat provider aktif
    void refreshSensors();

    // Request ulang setiap 5 detik
    const pollingInterval = setInterval(() => {
      void refreshSensors();
    }, 5000);

    // Tetap gunakan Socket.IO untuk pembaruan real-time
    const socket = createLiveSocket();

    socket.on("connect", () => {
      console.log("[SOCKET] Terhubung");
      dispatch({
        type: "SET_CONNECTED",
        connected: true,
      });

      void refreshSensors();
    });

    socket.on("disconnect", (reason) => {
      console.warn("[SOCKET] Terputus:", reason);
      dispatch({
        type: "SET_CONNECTED",
        connected: false,
      });
    });

    socket.on("sensor_upload", (payload: SensorUpdatePayload) => {
      console.log("[SOCKET] Data sensor diterima");

      dispatch({
        type: "UPSERT_SENSORS",
        sensors: mapPayload(payload),
      });
    });

    return () => {
      active = false;
      clearInterval(pollingInterval);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const updateSensorLocation = useCallback((sensorId: string, location: SensorLocation) => {
    dispatch({ type: "UPDATE_LOCATION", sensorId, location });
  }, []);

  const addFertilizationRecord = useCallback((sensorId: string, input: FertilizerInput) => {
    dispatch({ type: "ADD_FERTILIZATION", sensorId, input });
  }, []);

  // 3. Fungsi tunggal untuk mengupdate state global dan menulis ke penyimpanan lokal
  const updateSettings = useCallback(
    async (settings: Partial<AppSettings>) => {
      dispatch({
        type: "UPDATE_SETTINGS",
        settings,
      });

      try {
        const newSettings = {
          ...state.settings,
          ...settings,
        };

        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (e) {
        console.error("Gagal menyimpan pengaturan ke AsyncStorage:", e);
      }
    },
    [state.settings],
  );

  const getSensorById = useCallback(
    (id: string) =>
      state.sensors.find(
        (sensor) => String(sensor.id) === String(id)
      ),
    [state.sensors]
  );

  return (
    <SensorContext.Provider
      value={{
        sensors: state.sensors,
        settings: state.settings,
        connected: state.connected,
        updateSensorLocation,
        addFertilizationRecord,
        updateSettings,
        getSensorById,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensorStore(): SensorContextValue {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error("useSensorStore harus dipakai di dalam <SensorProvider>");
  }
  return context;
}
