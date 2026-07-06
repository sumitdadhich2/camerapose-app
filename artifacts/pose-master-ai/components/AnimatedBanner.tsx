import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import * as Haptics from 'expo-haptics';

interface AnimatedBannerProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  style?: any;
}

export function AnimatedBanner({ title, subtitle, onPress, style }: AnimatedBannerProps) {
  const colors = useColors();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={[styles.container, style]}>
      <LinearGradient
        colors={['#1a1a1a', '#333333']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: colors.radius, borderColor: colors.primary, borderWidth: 1 }]}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: '#ffffff' }]}>{subtitle}</Text>
          </View>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 213, 79, 0.2)', borderRadius: colors.radius }]}>
            <Ionicons name="star" size={24} color={colors.primary} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  gradient: {
    padding: SPACING.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
