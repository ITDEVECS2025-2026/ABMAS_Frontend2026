import { Text, View } from "react-native";

type Props = {
  sensor: {
    id: string;
    status: string;
    nitrogen?: number;
    phosphor?: number;
    kalium?: number;
    ec?: number;
    ph?: number;
    temperature?: number;
    humidity?: number;
    battery?: number;
    gps?: string;
  };
};

export default function SensorCard({ sensor }: Props) {
  return (
    <View
      style={{
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <Text>{sensor.id}</Text>

      <Text>Status : {sensor.status}</Text>

      <Text>N : {sensor.nitrogen ?? "-"}</Text>

      <Text>P : {sensor.phosphor ?? "-"}</Text>

      <Text>K : {sensor.kalium ?? "-"}</Text>

      <Text>EC : {sensor.ec ?? "-"}</Text>

      <Text>pH : {sensor.ph ?? "-"}</Text>

      <Text>Temp : {sensor.temperature ?? "-"}</Text>

      <Text>Humidity : {sensor.humidity ?? "-"}</Text>

      <Text>Battery : {sensor.battery ?? "-"}</Text>

      <Text>GPS : {sensor.gps ?? "-"}</Text>
    </View>
  );
}