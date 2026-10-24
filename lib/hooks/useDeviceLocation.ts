import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState } from "react-native";

export type LocationStatus = "loading" | "ready" | "denied" | "services-off" | "error";

export interface DeviceCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

function toCoords(position: Location.LocationObject): DeviceCoords {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

// Mengikuti posisi GPS perangkat selama layar aktif.
// Pemantauan berhenti saat layar kehilangan fokus atau aplikasi masuk latar belakang.
export function useDeviceLocation() {
  const [coords, setCoords] = useState<DeviceCoords | null>(null);
  const [status, setStatus] = useState<LocationStatus>("loading");

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const runIdRef = useRef(0);

  const stop = useCallback(() => {
    runIdRef.current += 1; // membatalkan start() yang masih berjalan
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const start = useCallback(async () => {
    stop();
    const runId = runIdRef.current;
    const isStale = () => runId !== runIdRef.current;

    setStatus((prev) => (prev === "ready" ? prev : "loading"));

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (isStale()) return;
      if (permission.status !== "granted") {
        setCoords(null);
        setStatus("denied");
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (isStale()) return;
      if (!servicesEnabled) {
        setCoords(null);
        setStatus("services-off");
        return;
      }

      // Posisi terakhir (maksimal 5 menit) agar tampil cepat sebelum GPS mendapat fix
      const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
      if (isStale()) return;
      if (lastKnown) {
        setCoords(toCoords(lastKnown));
        setStatus("ready");
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 25,
        },
        (position) => {
          setCoords(toCoords(position));
          setStatus("ready");
        }
      );

      if (isStale()) {
        subscription.remove();
        return;
      }
      subscriptionRef.current = subscription;
    } catch (error) {
      if (isStale()) return;
      console.warn("[useDeviceLocation] gagal mengambil lokasi:", error);
      setStatus((prev) => (prev === "ready" ? prev : "error"));
    }
  }, [stop]);

  useFocusEffect(
    useCallback(() => {
      start();

      // Saat kembali dari pengaturan HP (izin atau GPS baru diaktifkan), coba lagi otomatis
      const appStateSubscription = AppState.addEventListener("change", (nextState) => {
        if (nextState === "active") start();
        else if (nextState === "background") stop();
      });

      return () => {
        appStateSubscription.remove();
        stop();
      };
    }, [start, stop])
  );

  return { coords, status, retry: start };
}