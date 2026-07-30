import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";

interface Option {
  label: string;
  value: string;
}

interface AnalysisDropdownProps {
  visible: boolean;
  title: string;
  options: Option[];
  selectedValue: string | null;
  onSelect: (value: string, label: string) => void;
  onClose: () => void;
}

export default function AnalysisDropdown({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: AnalysisDropdownProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.popupContainer} onPress={() => {}}>
          <Text style={styles.popupTitle}>{title}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.value, item.label);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  popupContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a5c2a",
    marginBottom: 10,
    textAlign: "center",
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#f1f5f1",
  },
  optionItemSelected: {
    backgroundColor: "#2e7d32",
  },
  optionText: {
    fontSize: 14,
    color: "#1a5c2a",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
});