import { View, Text } from "react-native";
import { router } from "expo-router";

// nanti dari API
const lahanList = [
  {
    id: "1",
    nama: "Lahan Pak Mateno",
  },
  {
    id: "2",
    nama: "Lahan Jagung",
  },
];

export default function MonitoringPage() {
  return (
    <View style={{ flex: 1, padding: 20 }}>

      <Text style={{ fontSize: 24 }}>
        Monitoring Tanah
      </Text>

      {
        lahanList.map((item) => (

          <View
            key={item.id}
            style={{
              marginTop: 15,
              borderWidth: 1,
              padding: 16,
            }}
          >

            <Text>{item.nama}</Text>

            <Text
              onPress={() =>
                router.push(`/(monitoring)/${item.id}`)
              }
            >
              Lihat Monitoring →
            </Text>

          </View>

        ))
      }

    </View>
  );
}