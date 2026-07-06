import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';

export default function PrivacyScreen() {
  const colors = useColors();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground }]}>Privacy Policy</Text>
      
      <Text style={[styles.heading, { color: colors.foreground }]}>1. Information We Collect</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        Pose Master AI is an offline-first application. We do not upload your photos to our servers. Any pose detection or AI processing happens entirely on your device.
      </Text>

      <Text style={[styles.heading, { color: colors.foreground }]}>2. Camera Access</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        We require camera access to provide the core functionality of overlaying pose templates onto your camera viewfinder. This feed is never transmitted off your device.
      </Text>

      <Text style={[styles.heading, { color: colors.foreground }]}>3. Storage</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        Your favorited templates, recent history, and settings are saved locally on your device using encrypted storage. If you choose to log in, basic profile information is synced.
      </Text>

      <Text style={[styles.heading, { color: colors.foreground }]}>4. Analytics</Text>
      <Text style={[styles.paragraph, { color: colors.mutedForeground }]}>
        We collect anonymous usage data (like which templates are most popular) to improve the app. This contains no personally identifiable information and can be disabled in Settings.
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
