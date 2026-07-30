import { useFonts } from "expo-font";

export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsItalic: require("../assets/fonts/Poppins-Italic.ttf"),
  });

  return fontsLoaded;
}