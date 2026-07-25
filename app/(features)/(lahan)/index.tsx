// app/(soil)/(lahanbaru)/index.tsx

import { SafeAreaView, Text } from "react-native";
import BottomNavbar from "@/components/navbar/bottomNavar";

export default function LahanBaruPage() {
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
        Tambah Lahan
      </Text>

    </SafeAreaView>
  );
}