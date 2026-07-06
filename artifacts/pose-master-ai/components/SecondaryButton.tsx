import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import * as Haptics from 'expo-haptics';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export function SecondaryButton({ title, onPress, disabled, loading, style }: SecondaryButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.secondary, borderRadius: colors.radius },
        disabled && { opacity: 0.5 },
        style
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.secondaryForeground} />
      ) : (
        <Text style={[styles.text, { color: colors.secondaryForeground }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: {
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.md,
  }
});
