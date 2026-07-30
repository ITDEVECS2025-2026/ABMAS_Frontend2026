export function useNormalizedURL(url: string): string {
  let normalized = url.trim();

  if (normalized.startsWith("mqtt://") || normalized.startsWith("tcp://")) {
    normalized = normalized.replace("mqtt://", "").replace("tcp://", "");
    return `ws://${normalized.replace(":1883", ":8083")}/mqtt`;
  }

  if (normalized.startsWith("mqtts://") || normalized.startsWith("ssl://")) {
    normalized = normalized.replace("mqtts://", "").replace("ssl://", "");
    return `wss://${normalized.replace(":8883", ":8084")}/mqtt`;
  }

  return normalized;
}
