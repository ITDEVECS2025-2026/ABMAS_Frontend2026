import { Stack } from "expo-router";
import BottomNavbar from "@/components/navbar/bottomNavar";

export default function MainLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />

      <BottomNavbar />
    </>
  );
}