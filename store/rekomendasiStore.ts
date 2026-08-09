import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRekomendasi } from '@/utils/ruleEngine';

type HasilRekomendasi = ReturnType<typeof getRekomendasi>;

interface RekomendasiStore {
  rekomendasiData: Record<string, HasilRekomendasi>;
  setRekomendasi: (sensorId: string, data: HasilRekomendasi) => void;
}

export const useRekomendasiStore = create<RekomendasiStore>()(
  persist(
    (set) => ({
      rekomendasiData: {},
      
      setRekomendasi: (sensorId, data) => 
        set((state) => ({
          rekomendasiData: {
            ...state.rekomendasiData,
            [sensorId]: data,
          },
        })),
    }),
    {
      name: 'rekomendasi-storage', 
      storage: createJSONStorage(() => AsyncStorage), 
    }
  )
);