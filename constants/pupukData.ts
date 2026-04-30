import { VarietasData } from "@/interfaces/Analysis";

export const VARIETAS_DATA: VarietasData[] = [
  {
    label: "Jagung",
    value: "jagung",
    pupukOptions: [
      { label: "Tunggal (Urea, Sp36, KCl)", value: "tunggal_jagung" },
      { label: "Majemuk Phonska (16:16:16)", value: "phonska_16" },
      { label: "Majemuk Phonska (15:15:12)", value: "phonska_15" },
    ],
  },
  {
    label: "Padi",
    value: "padi",
    pupukOptions: [
      { label: "Tunggal (Urea, Sp36, KCl)", value: "tunggal_padi" },
      { label: "Majemuk Phonska (16:16:16)", value: "phonska_16_padi" },
      { label: "Majemuk Phonska (15:15:12)", value: "phonska_15_padi" },
    ],
  },
];