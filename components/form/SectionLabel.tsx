// components/form/SectionLabel.tsx
import React from "react";
import { View, Text } from "react-native";
import { scale } from "../../utils/scale";

interface SectionLabelProps {
  icon: any;
  label: string;
}

export default function SectionLabel({ icon: Icon, label }: SectionLabelProps) {
  return (
    <View 
      style={{ 
        flexDirection: "row", 
        alignItems: "center",
        gap: scale(8),
      }}
    >
      <Icon size={scale(22)} color="#1E1E1E" />
      <Text
        style={{
          fontFamily: "PoppinsBold",
          fontSize: scale(16),
          color: "#1E1E1E",
          includeFontPadding: false,
          textAlignVertical: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}