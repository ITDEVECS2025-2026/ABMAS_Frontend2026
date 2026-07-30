import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';

interface ParameterCardProps {
  label: string;
  value: string | number;
  statusColor?: string;
}

export default function ParameterCard({
  label,
  value,
  statusColor = COLORS.primaryLight,
}: ParameterCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    flex: 1,
    margin: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
});