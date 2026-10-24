import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

function getWeatherDescription(code: number): string {
  switch (code) {
    case 0:
      return "Cerah";
    case 1:
    case 2:
    case 3:
      return "Berawan";
    case 45:
    case 48:
      return "Berkabut";
    case 51:
    case 53:
    case 55:
      return "Gerimis ringan";
    case 61:
    case 63:
      return "Hujan ringan/sedang";
    case 65:
      return "Hujan deras";
    case 80:
    case 81:
      return "Hujan sesaat";
    case 82:
      return "Hujan deras sesaat";
    case 71:
    case 73:
    case 75:
      return "Salju";
    case 95:
    case 96:
    case 99:
      return "Badai petir";
    default:
      return "Kondisi normal";
  }
}

// Cuaca mengikuti koordinat perangkat. Data diambil ulang setiap layar kembali fokus
// atau saat posisi berpindah lebih dari sekitar 1 km.
export function useWeather(latitude?: number, longitude?: number) {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [forecastText, setForecastText] = useState("Memuat prakiraan cuaca...");
  const [loading, setLoading] = useState(true);

  // Dibulatkan 2 desimal agar pergeseran kecil GPS tidak memicu permintaan ulang
  const key =
    latitude !== undefined && longitude !== undefined
      ? `${latitude.toFixed(2)},${longitude.toFixed(2)}`
      : null;

  useFocusEffect(
    useCallback(() => {
      if (!key) return;

      const [lat, lon] = key.split(",");
      const controller = new AbortController();

      (async () => {
        try {
          const url =
            `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m` +
            `&hourly=precipitation_probability,weather_code` +
            `&timezone=auto&forecast_days=2`;

          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();

          if (data?.current) {
            setTemperature(data.current.temperature_2m);
            setHumidity(data.current.relative_humidity_2m);
          }

          const times: string[] | undefined = data?.hourly?.time;
          if (times) {
            const codes: number[] = data.hourly.weather_code ?? data.hourly.weathercode ?? [];
            const probabilities: (number | null)[] = data.hourly.precipitation_probability ?? [];

            // Jam saat ini dalam zona waktu lokasi, format sama dengan data API (YYYY-MM-DDTHH:mm)
            const offsetMs = (data.utc_offset_seconds ?? 0) * 1000;
            const nowLocal = new Date(Date.now() + offsetMs).toISOString().slice(0, 16);
            const index = times.findIndex((t) => t >= nowLocal);

            if (index >= 0) {
              const hour = times[index].slice(11, 16);
              const condition = getWeatherDescription(codes[index]).toLowerCase();
              const rainProbability = probabilities[index] ?? 0;

              setForecastText(
                rainProbability > 40
                  ? `Potensi ${condition} diperkirakan pukul ${hour} (${rainProbability}% peluang).`
                  : `Cuaca ${condition} diperkirakan pukul ${hour}.`
              );
            } else {
              setForecastText("Prakiraan cuaca stabil untuk beberapa jam ke depan.");
            }
          }
        } catch (error: any) {
          if (error?.name === "AbortError") return;
          console.warn("[useWeather] gagal memuat cuaca:", error);
          setForecastText("Gagal memuat prakiraan cuaca.");
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      })();

      return () => controller.abort();
    }, [key])
  );

  return { temperature, humidity, forecastText, loading };
}