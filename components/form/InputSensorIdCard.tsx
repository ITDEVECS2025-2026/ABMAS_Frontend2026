// components/form/InputSensorIdCard.tsx
import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { PlusCircle, Pencil } from "lucide-react-native";
import { scale } from "../../utils/scale";

interface InputSensorIdCardProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (sensorId: string) => void;
  placeholder?: string;
}

export default function InputSensorIdCard({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Contoh :489289121",
}: InputSensorIdCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  function handleSubmit() {
    if (!value.trim()) return;
    onSubmit(value.trim());
    inputRef.current?.blur();
    setIsEditing(false);
  }

  return (
    <View
      style={{
        width: scale(336),
        borderRadius: scale(12),
        borderWidth: scale(1.5),
        borderColor: "#58C15C",
        backgroundColor: "#FFFFFF",
        padding: scale(14),
        alignSelf: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: scale(8), marginBottom: scale(10) }}>
        <PlusCircle size={scale(20)} color="#2C8A40" />
        <Text style={{ fontFamily: "PoppinsBold", fontSize: scale(16), color: "#1A202C" }}>
          Input ID
        </Text>
      </View>

      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={{
          width: "100%",
          height: scale(50),
          borderRadius: scale(10),
          backgroundColor: "#F7F9FC",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: scale(14),
          justifyContent: "space-between",
        }}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsEditing(true)}
          placeholder={placeholder}
          placeholderTextColor="#1E1E1E"
          keyboardType="numeric"
          style={{
            flex: 1,
            height: scale(50),
            color: "#1E1E1E",
            fontFamily: "PoppinsItalic",
            fontSize: scale(15),
            includeFontPadding: false,
            textAlignVertical: "center",
            paddingVertical: 0,
          }}
        />

        {isEditing ? (
          <Pressable
            onPress={handleSubmit}
            style={{
              width: scale(80),
              height: scale(29),
              justifyContent: "center",
              alignItems: "center",
              borderRadius: scale(10),
              backgroundColor: "#105C2E",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                textAlign: "center",
                fontFamily: "PoppinsMedium",
                fontSize: scale(13),
                includeFontPadding: false,
                textAlignVertical: "center",
              }}
            >
              Lanjut
            </Text>
          </Pressable>
        ) : (
          <Pencil size={scale(20)} color="#006134" />
        )}
      </Pressable>
    </View>
  );
}