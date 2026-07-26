import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          marginTop: 40,
          textAlign: "center",
        }}
      >
        History
      </Text>
    </SafeAreaView>
  );
}
