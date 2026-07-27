import { View, Text, Button } from "react-native";
import { useLocalSearchParams } from "expo-router";

// TODO
const fetchMonitoring = async () => {
  return {};
};

const sensors = [
  {
    id: "S1",
    status: "Online",
  },
  {
    id: "S2",
    status: "Online",
  },
  {
    id: "S3",
    status: "Offline",
  },
];

export default function MonitoringDetailPage() {

  const { lahanId } = useLocalSearchParams();

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
      }}
    >

      <Text style={{ fontSize: 24 }}>
        Monitoring Lahan
      </Text>

      <Text>ID Lahan : {lahanId}</Text>

      <View
        style={{
          marginTop: 20,
          borderWidth: 1,
          padding: 16,
        }}
      >
        <Text>Nama Lahan</Text>
        <Text>Padi</Text>
        <Text>Target Panen</Text>
      </View>

      <Text
        style={{
          marginTop: 25,
          fontSize: 18,
        }}
      >
        Daftar Sensor
      </Text>

      {
        sensors.map((sensor) => (

          <View
            key={sensor.id}
            style={{
              marginTop: 15,
              borderWidth: 1,
              padding: 15,
            }}
          >

            <Text>{sensor.id}</Text>

            <Text>Status : {sensor.status}</Text>

            <Text>N : -</Text>
            <Text>P : -</Text>
            <Text>K : -</Text>

            <Text>EC : -</Text>

            <Text>pH : -</Text>

            <Text>Temp : -</Text>

            <Text>Hum : -</Text>

            <Text>Battery : -</Text>

            <Text>GPS : -</Text>

          </View>

        ))
      }

      <Button
        title="Isi Data Pupuk"
        onPress={() => {}}
      />

    </View>
  );
}