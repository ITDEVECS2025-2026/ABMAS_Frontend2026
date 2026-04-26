// store/sensorContext.tsx

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Sensor, SensorLocation, FertilizerInput, AppSettings } from '../interfaces';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SensorState {
  sensors: Sensor[];
  settings: AppSettings;
}

type Action =
  | { type: 'UPDATE_LOCATION'; sensorId: string; location: SensorLocation }
  | { type: 'ADD_FERTILIZATION'; sensorId: string; input: FertilizerInput }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> };

interface SensorContextValue {
  sensors: Sensor[];
  settings: AppSettings;
  updateSensorLocation: (sensorId: string, location: SensorLocation) => void;
  addFertilizationRecord: (sensorId: string, input: FertilizerInput) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  getSensorById: (id: string) => Sensor | undefined;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const generateMockSensor = (index: number): Sensor => ({
  id: `sensor-${index}`,
  name: `Sensor ${index}`,
  soilData: {
    N: Math.floor(Math.random() * 100) + 20,
    P: Math.floor(Math.random() * 80) + 10,
    K: Math.floor(Math.random() * 120) + 30,
    EC: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
    pH: parseFloat((Math.random() * 3 + 5).toFixed(1)),
  },
  status: {
    battery: Math.floor(Math.random() * 40) + 60,
    batteryHealth: 'Good',
    loraStatus: 'Connected',
    gps: 'Active',
  },
  location: null,
  lastUpdated: Date.now() - 120000,
  fertilizationHistory: [],
});

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SensorState = {
  sensors: Array.from({ length: 5 }, (_, i) => generateMockSensor(i + 1)),
  settings: {
    debugMode: false,
    connectionTopic: 'abmasoes/petani',
    farmerName: 'PRIA SOLO REAL',
    darkMode: true,
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function sensorReducer(state: SensorState, action: Action): SensorState {
  switch (action.type) {
    case 'UPDATE_LOCATION':
      return {
        ...state,
        sensors: state.sensors.map((s) =>
          s.id === action.sensorId ? { ...s, location: action.location } : s
        ),
      };

    case 'ADD_FERTILIZATION':
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
            : s
        ),
      };

    case 'UPDATE_SETTINGS':
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

  const updateSensorLocation = useCallback((sensorId: string, location: SensorLocation) => {
    dispatch({ type: 'UPDATE_LOCATION', sensorId, location });
  }, []);

  const addFertilizationRecord = useCallback((sensorId: string, input: FertilizerInput) => {
    dispatch({ type: 'ADD_FERTILIZATION', sensorId, input });
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  const getSensorById = useCallback(
    (id: string) => state.sensors.find((s) => s.id === id),
    [state.sensors]
  );

  return (
    <SensorContext.Provider
      value={{
        sensors: state.sensors,
        settings: state.settings,
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

// ─── Custom Hook (pengganti useSensorStore) ───────────────────────────────────

export function useSensorStore(): SensorContextValue {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensorStore harus dipakai di dalam <SensorProvider>');
  }
  return context;
}