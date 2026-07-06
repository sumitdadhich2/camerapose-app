import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import * as Haptics from 'expo-haptics';

interface PremiumCardProps {
  title: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  onPress: () => void;
}

export function PremiumCard({ title, price, features, isPopular, onPress }: PremiumCardProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: isPopular ? colors.primary : colors.border,
          borderWidth: isPopular ? 2 : 1,
        }
      ]}
    >
      {isPopular && (
        <View style={[styles.badge, { backgroundColor: colors.primary, borderBottomLeftRadius: colors.radius }]}>
          <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
      </View>
      
      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    zIndex: 1,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.xs,
  },
  price: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
  },
  features: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  }
});
