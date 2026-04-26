import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';
import { getSoilStatus, getSoilUnit } from '../../utils/format';

interface GaugeCardProps {
  label: string;
  value: number;
  flex?: number;
}

export default function GaugeCard({ label, value, flex = 1 }: GaugeCardProps) {
  const status = getSoilStatus(label, value);
  const unit = getSoilUnit(label);
  const statusColor =
    status === 'low' ? COLORS.warning : status === 'high' ? COLORS.danger : COLORS.primaryLight;

  return (
    <View style={[styles.card, { flex }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: statusColor }]}>
        {value}{unit ? ` ${unit}` : ''}
      </Text>
      <View style={[styles.indicator, { backgroundColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  label: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
  indicator: {
    height: 3,
    width: 30,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
});