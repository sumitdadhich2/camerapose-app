import React from 'react';
import { View, ScrollView, Text, StyleSheet, Image } from 'react-native';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const colors = useColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary, borderRadius: colors.radius * 2 }]}>
          <Ionicons name="body" size={48} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Pose Master AI</Text>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>Version 1.0.0</Text>
      </View>

      <Text style={[styles.description, { color: colors.foreground }]}>
        Pose Master AI is your personal photography coach in your pocket. Built for offline-first usage, ensuring your privacy while delivering professional results.
      </Text>

      <View style={[styles.credits, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Text style={[styles.creditsTitle, { color: colors.foreground }]}>Credits & Open Source</Text>
        
        <View style={styles.creditItem}>
          <Text style={[styles.creditName, { color: colors.foreground }]}>React Native</Text>
          <Text style={[styles.creditRole, { color: colors.mutedForeground }]}>Framework</Text>
        </View>
        <View style={styles.creditItem}>
          <Text style={[styles.creditName, { color: colors.foreground }]}>Expo</Text>
          <Text style={[styles.creditRole, { color: colors.mutedForeground }]}>Toolchain</Text>
        </View>
        <View style={styles.creditItem}>
          <Text style={[styles.creditName, { color: colors.foreground }]}>Zustand</Text>
          <Text style={[styles.creditRole, { color: colors.mutedForeground }]}>State Management</Text>
        </View>
      </View>

      <Text style={[styles.copyright, { color: colors.mutedForeground }]}>
        © {new Date().getFullYear()} Pose Master AI. All rights reserved.
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    marginBottom: 4,
  },
  version: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  description: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  credits: {
    width: '100%',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  creditsTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: SPACING.md,
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  creditName: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  creditRole: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  copyright: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  }
});
