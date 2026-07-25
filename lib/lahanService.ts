// lib/lahanService.ts
import { Lahan } from '../interfaces';

// ⚠️ SEMENTARA: backend endpoint /lahan belum tersedia.
// Data disimpan di memory (hilang saat app di-restart), hanya untuk keperluan development.
// TODO: ganti isi function di bawah dengan fetch() asli begitu backend sudah siap.

let mockLahanStorage: Lahan[] = [];

export async function getLahanList(): Promise<Lahan[]> {
  // Simulasi delay network supaya loading state di UI bisa dites juga
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockLahanStorage;
}

export async function saveLahan(payload: Omit<Lahan, 'id'>): Promise<Lahan> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newLahan: Lahan = {
    id: `local-${Date.now()}`, // id sementara, nanti diganti id asli dari server
    ...payload,
  };

  mockLahanStorage.push(newLahan);
  console.log('[MOCK] Lahan tersimpan (sementara, belum ke server):', newLahan);

  return newLahan;
}