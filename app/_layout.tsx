import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SensorProvider } from "@/store/sensorContext";

import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PoppinsLight: Poppins_300Light,
    PoppinsRegular: Poppins_400Regular,
    PoppinsMedium: Poppins_500Medium,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SensorProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SensorProvider>
    </SafeAreaProvider>
  );
}