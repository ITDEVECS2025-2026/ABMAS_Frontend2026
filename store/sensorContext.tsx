// store/sensorContext.tsx

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Sensor, SensorLocation, FertilizerInput, AppSettings } from '../interfaces';
import { fetchInitialSensors } from '../lib/api';
import { createLiveSocket } from '../lib/socket';
import { mapPayload, SensorUpdatePayload } from '../utils/mapPayload';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SensorState {
  sensors: Sensor[];
  settings: AppSettings;
  connected: boolean;
}

type Action =
  | { type: 'UPSERT_SENSORS'; sensors: Sensor[] }
  | { type: 'SET_CONNECTED'; connected: boolean }
  | { type: 'UPDATE_LOCATION'; sensorId: string; location: SensorLocation }
  | { type: 'ADD_FERTILIZATION'; sensorId: string; input: FertilizerInput }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> };

interface SensorContextValue {
  sensors: Sensor[];
  settings: AppSettings;
  connected: boolean;
  updateSensorLocation: (sensorId: string, location: SensorLocation) => void;
  addFertilizationRecord: (sensorId: string, input: FertilizerInput) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  getSensorById: (id: string) => Sensor | undefined;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: SensorState = {
  sensors: [],
  settings: {
    debugMode: false,
    connectionTopic: 'abmasoes/petani',
    farmerName: 'PRIA SOLO REAL',
    darkMode: true,
  },
  connected: false,
};

// Merge incoming readings into existing sensors by id. Live/REST data owns the
// soil + status fields; the client owns fertilizationHistory and any location
// the user set manually, so those are preserved across updates.
function upsertSensors(existing: Sensor[], incoming: Sensor[]): Sensor[] {
  const byId = new Map(existing.map((s) => [s.id, s]));
  for (const next of incoming) {
    const prev = byId.get(next.id);
    byId.set(next.id, {
      ...next,
      fertilizationHistory: prev?.fertilizationHistory ?? next.fertilizationHistory,
      location: next.location ?? prev?.location ?? null,
    });
  }
  return Array.from(byId.values());
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function sensorReducer(state: SensorState, action: Action): SensorState {
  switch (action.type) {
    case 'UPSERT_SENSORS':
      return { ...state, sensors: upsertSensors(state.sensors, action.sensors) };

    case 'SET_CONNECTED':
      return { ...state, connected: action.connected };

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

  // Backfill from REST once, then stream live updates from the /live namespace.
  useEffect(() => {
    let active = true;

    fetchInitialSensors()
      .then((sensors) => {
        if (active) dispatch({ type: 'UPSERT_SENSORS', sensors });
      })
      .catch((err) => console.warn('Initial sensor fetch failed:', err.message));

    const socket = createLiveSocket();
    socket.on('connect', () => dispatch({ type: 'SET_CONNECTED', connected: true }));
    socket.on('disconnect', () => dispatch({ type: 'SET_CONNECTED', connected: false }));
    socket.on('sensor:update', (payload: SensorUpdatePayload) => {
      dispatch({ type: 'UPSERT_SENSORS', sensors: mapPayload(payload) });
    });

    return () => {
      active = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

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

// ─── Custom Hook (pengganti useSensorStore) ───────────────────────────────────

export function useSensorStore(): SensorContextValue {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensorStore harus dipakai di dalam <SensorProvider>');
  }
  return context;
}