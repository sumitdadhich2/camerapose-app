import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { PremiumCard } from '../components/PremiumCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function SubscriptionScreen() {
  const colors = useColors();

  const handleSubscribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert('Subscription features coming soon!');
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 213, 79, 0.2)', borderRadius: colors.radius * 2 }]}>
          <Ionicons name="star" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Pose Master Pro</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Unlock your full photography potential</Text>
      </View>

      <View style={styles.plans}>
        <PremiumCard
          title="Monthly Plan"
          price="$4.99 / mo"
          features={[
            "Unlimited pose templates",
            "Advanced AI matching",
            "Voice guidance assistant",
            "High-res exports",
            "No watermark"
          ]}
          onPress={handleSubscribe}
        />
        
        <PremiumCard
          title="Yearly Plan"
          price="$29.99 / yr"
          features={[
            "All Monthly features",
            "Save 50% vs monthly",
            "Exclusive pro templates",
            "Priority support"
          ]}
          isPopular
          onPress={handleSubscribe}
        />
      </View>

      <PrimaryButton 
        title="Start 3-Day Free Trial" 
        onPress={handleSubscribe}
        style={styles.ctaButton}
      />
      
      <Text style={[styles.termsText, { color: colors.mutedForeground }]}>
        Payment will be charged to your account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
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
    paddingTop: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
  },
  plans: {
    marginBottom: SPACING.xl,
  },
  ctaButton: {
    marginBottom: SPACING.lg,
  },
  termsText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  }
});
