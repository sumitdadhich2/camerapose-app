import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: any;
}

export function SectionHeader({ title, actionTitle, onActionPress, style }: SectionHeaderProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {actionTitle && onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  action: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  }
});
