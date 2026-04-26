import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Layout() {
  return (
    <SafeAreaView 
    style={{flex: 1, backgroundColor:'white'}}
    edges={['top', 'bottom']}
    >
      <Stack screenOptions={{ headerShown: true,
          title: 'kembali'
       }} />
    </SafeAreaView>
  )
}