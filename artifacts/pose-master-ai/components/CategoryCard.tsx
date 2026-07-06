import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import * as Haptics from 'expo-haptics';

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  onPress: () => void;
  style?: any;
}

export function CategoryCard({ name, icon, count, onPress, style }: CategoryCardProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: colors.card, borderRadius: colors.radius },
        style
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
        <Ionicons name={icon as any} size={28} color={colors.foreground} />
      </View>
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>{count} templates</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 2,
    textAlign: 'center',
  },
  count: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  }
});
