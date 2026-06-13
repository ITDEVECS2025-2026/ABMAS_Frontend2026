import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "@/constants";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcons?: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({ title, showBack = true, rightIcons, style }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 14 }, style]}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 22 }} />
      )}
      <Text style={styles.title}>{title}</Text>
      {rightIcons ?? <View style={{ width: 22 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  title: { color: "#fff", fontWeight: "800", fontSize: 16 },
});