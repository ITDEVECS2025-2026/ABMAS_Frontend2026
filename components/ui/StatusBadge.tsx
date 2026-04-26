import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';

interface StatusBadgeProps {
  label: string;
  type?: 'success' | 'warning' | 'info';
}

export default function StatusBadge({ label, type = 'success' }: StatusBadgeProps) {
  const color =
    type === 'success' ? COLORS.success : type === 'warning' ? COLORS.warning : COLORS.primaryLight;

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});