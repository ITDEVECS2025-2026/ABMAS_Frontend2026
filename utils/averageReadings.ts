//utils/averageReadings.ts
export interface SensorReading {
  N: number;
  P: number;
  K: number;
  EC: number;
  pH: number;
}

/**
 * Calculates the average of an array of NPK, EC, and pH sensor readings.
 * 
 * @param readings - Array of sensor reading objects
 * @returns An object with the averaged values (rounded to 2 decimal places), or null if the array is empty.
 */

export interface SensorReading {
  N: number;
  P: number;
  K: number;
  EC: number;
  pH: number;
  temperature?: number;
  humidity?: number;
}

interface SensorAccumulator {
  N: number;
  P: number;
  K: number;
  EC: number;
  pH: number;
  temperature: number;
  humidity: number;
  temperatureCount: number;
  humidityCount: number;
}

export function averageSensorReadings(
  readings: SensorReading[]
): SensorReading | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  const sums = readings.reduce<SensorAccumulator>(
    (acc, curr) => {
      return {
        N: acc.N + (Number(curr.N) || 0),
        P: acc.P + (Number(curr.P) || 0),
        K: acc.K + (Number(curr.K) || 0),
        EC: acc.EC + (Number(curr.EC) || 0),
        pH: acc.pH + (Number(curr.pH) || 0),

        temperature:
          acc.temperature +
          (curr.temperature != null && Number.isFinite(Number(curr.temperature))
            ? Number(curr.temperature)
            : 0),

        humidity:
          acc.humidity +
          (curr.humidity != null && Number.isFinite(Number(curr.humidity))
            ? Number(curr.humidity)
            : 0),

        temperatureCount:
          acc.temperatureCount +
          (curr.temperature != null && Number.isFinite(Number(curr.temperature))
            ? 1
            : 0),

        humidityCount:
          acc.humidityCount +
          (curr.humidity != null && Number.isFinite(Number(curr.humidity))
            ? 1
            : 0),
      };
    },
    {
      N: 0,
      P: 0,
      K: 0,
      EC: 0,
      pH: 0,
      temperature: 0,
      humidity: 0,
      temperatureCount: 0,
      humidityCount: 0,
    }
  );

  const count = readings.length;

  return {
    N: Number((sums.N / count).toFixed(2)),
    P: Number((sums.P / count).toFixed(2)),
    K: Number((sums.K / count).toFixed(2)),
    EC: Number((sums.EC / count).toFixed(2)),
    pH: Number((sums.pH / count).toFixed(2)),

    temperature:
      sums.temperatureCount > 0
        ? Number(
            (sums.temperature / sums.temperatureCount).toFixed(2)
          )
        : undefined,

    humidity:
      sums.humidityCount > 0
        ? Number(
            (sums.humidity / sums.humidityCount).toFixed(2)
          )
        : undefined,
  };
}
