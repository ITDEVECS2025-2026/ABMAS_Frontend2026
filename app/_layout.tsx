import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SensorProvider } from "@/store/sensorContext";
import { useCustomFonts } from "@/styles/fonts";

import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_400Regular_Italic
} from "@expo-google-fonts/poppins";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PoppinsLight: Poppins_300Light,
    PoppinsRegular: Poppins_400Regular,
    PoppinsMedium: Poppins_500Medium,
    PoppinsSemiBold: Poppins_600SemiBold,
    PoppinsBold: Poppins_700Bold,
    PoppinsItalic: Poppins_400Regular_Italic,
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