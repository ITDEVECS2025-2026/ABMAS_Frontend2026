// app/(main)/lahan/index.tsx --> page input lahan baru
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ScreenHeader from "../../components/ui/ScreenHeader";
import AddLahanCard from "../../components/form/AddlahanCard";
import { useSensorStore } from "@/store/sensorContext"; 

export default function LahanBaruPage() {
  const router = useRouter();
  const { addLahan } = useSensorStore();
  const [namaLahan, setNamaLahan] = useState("");

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Input Lahan Baru" onBack={() => router.back()} />
      <ScrollView className="flex-1 px-4 pt-5">
        <AddLahanCard 
        value={namaLahan}
        onChangeText={setNamaLahan}
        onAdd={() => {
          //proses tambah lahan
        }} />
      </ScrollView>
    </View>
  );
}