import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const menu = [
    {
      title: "Monitoring Burung",
      description: "Pantau aktivitas burung secara real-time.", 
      route: "(burung)",
    },
    {
      title: "Monitoring Tanah (Soil)",
      description: "Lihat data kelembapan & suhu tanah secara akurat.",
      route: "(soil)",
    },
  ];


  return (
    <View className="flex-1 bg-white px-6 py-10">
      <Text className="text-2xl font-bold mb-6 text-gray-800">
        Selamat Datang 👋
      </Text>

      <View className="flex-col space-y-5">
        {menu.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(`/${item.route}`)}
            className="bg-blue-100 rounded-2xl p-5 flex-row items-center shadow-md"
            activeOpacity={0.8}
          >
            <Image
              source={item.image}
              className="w-16 h-16 mr-4 rounded-xl"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {item.title}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View> // rest
  );
}
