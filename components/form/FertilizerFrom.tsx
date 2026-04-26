import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { FertilizerInput } from '../../interfaces';

interface FertilizerFormProps {
  onSubmit: (data: FertilizerInput) => void;
  onCancel: () => void;
}

export default function FertilizerForm({ onSubmit, onCancel }: FertilizerFormProps) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!type.trim() || !amount.trim()) {
      Alert.alert('Error', 'Jenis dan jumlah pupuk wajib diisi');
      return;
    }
    onSubmit({ type, amount: parseFloat(amount), note });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Isi Data Pupuk</Text>

      <Text style={styles.label}>Jenis Pupuk</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="Contoh: Urea, NPK, KCl"
        placeholderTextColor={COLORS.textMuted}
      />

      <Text style={styles.label}>Jumlah (kg/ha)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Catatan</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={note}
        onChangeText={setNote}
        placeholder="Catatan tambahan..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={3}
      />

      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit}>
          <Text style={styles.submitText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.white,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitBtn: { backgroundColor: COLORS.primary },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  submitText: { color: COLORS.white, fontWeight: '700' },
});