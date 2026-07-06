import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';

export default function TermsScreen() {
  const colors = useColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground }]}>Terms & Conditions</Text>
      
      <Text style={[styles.heading, { color: colors.foreground }]}>1. Acceptance of Terms</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        By accessing and using Pose Master AI, you accept and agree to be bound by the terms and provision of this agreement.
      </Text>

      <Text style={[styles.heading, { color: colors.foreground }]}>2. Use License</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        Permission is granted to temporarily download one copy of the app for personal, non-commercial viewing only. You may not modify or copy the templates for redistribution.
      </Text>

      <Text style={[styles.heading, { color: colors.foreground }]}>3. Subscriptions</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis depending on your subscription plan.
      </Text>

      <Text style={[styles.heading, { color: colors.foreground }]}>4. Disclaimer</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        The materials within the app are provided on an 'as is' basis. Pose Master AI makes no warranties, expressed or implied, regarding the perfectness of captured photos.
      </Text>
      
      <Text style={[styles.paragraph, { color: colors.mutedForeground, marginTop: SPACING.xl }]}>
        Last updated: {new Date().toLocaleDateString()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    marginBottom: SPACING.xl,
  },
  heading: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  paragraph: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
  }
});
