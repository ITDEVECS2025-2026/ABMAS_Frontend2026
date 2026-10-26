// hooks/useDeleteLahan.ts
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { deleteHistory } from "@/lib/api";
import { useLahanStore } from "@/store/lahanStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useRekomendasiStore } from "@/store/rekomendasiStore";
import { useHistoryStore } from "@/store/historystore";

export function useDeleteLahan(onDeleted?: (id: string) => void) {
  const removeLahan = useLahanStore((s) => s.removeLahan);
  const resetHistory = useHistoryStore((s) => s.reset);
  const hapusRekomendasiLahan = useRekomendasiStore((s) => s.hapusRekomendasiLahan);
  const removeRecordingsByLahan = useRecordingStore((s) => s.clearRecordingsByLahan);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteNow = useCallback(
    async (id: string) => {
      setDeletingId(id);
      try {
        // Hapus di server dulu, baru bersihkan data lokal.
        await deleteHistory(id);

        removeRecordingsByLahan(id);
        hapusRekomendasiLahan(id);
        resetHistory(id);
        removeLahan(id);

        onDeleted?.(id);
      } catch (error) {
        console.error("Gagal menghapus lahan:", error);
        Alert.alert(
          "Gagal menghapus",
          "Riwayat belum berhasil dihapus. Periksa koneksi internet lalu coba lagi."
        );
      } finally {
        setDeletingId(null);
      }
    },
    [
      removeLahan,
      resetHistory,
      hapusRekomendasiLahan,
      removeRecordingsByLahan,
      onDeleted,
    ]
  );

  const confirmDelete = useCallback(
    (id: string, namaLahan: string) => {
      if (deletingId) return;

      Alert.alert(
        "Hapus lahan?",
        `Lahan "${namaLahan}" beserta rekaman sensor, rekomendasi, dan status panennya akan dihapus permanen.`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => void deleteNow(id),
          },
        ]
      );
    },
    [deletingId, deleteNow]
  );

  return { confirmDelete, deletingId };
}