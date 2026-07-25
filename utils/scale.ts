// utils/scale.ts
import { Dimensions } from "react-native";

const FIGMA_WIDTH = 412; // lebar referensi desain figma kamu

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function scale(size: number): number {
  return (SCREEN_WIDTH / FIGMA_WIDTH) * size;
}