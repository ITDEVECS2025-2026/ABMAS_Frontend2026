import { SafeAreaView, Text } from "react-native";

export default function HistoryPage() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
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