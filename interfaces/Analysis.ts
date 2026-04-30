export interface PupukOption {
  label: string;
  value: string;
}

export interface VarietasData {
  label: string;
  value: string;
  pupukOptions: PupukOption[];
}

export interface AnalysisFormData {
  varietas: string | null;
  luasLahan: string;
  targetHasilPanen: string;
  selectedPupuk: string | null;
}