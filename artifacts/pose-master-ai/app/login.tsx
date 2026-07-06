import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../hooks/useColors';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { AuthService } from '../services/AuthService';
import { useAuthStore } from '../store/useAuthStore';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function LoginScreen() {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState<'google' | 'guest' | null>(null);
  const setUser = useAuthStore(s => s.setUser);

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      const user = await AuthService.signInWithGoogle();
      setUser(user);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading('guest');
    try {
      const user = await AuthService.signInAsGuest();
      setUser(user);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary, borderRadius: colors.radius * 2 }]}>
          <Ionicons name="body" size={48} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Pose Master AI</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Elevate your photography</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.form}>
        <TouchableOpacity 
          style={[styles.socialButton, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border, borderWidth: 1 }]}
          onPress={handleGoogleLogin}
          disabled={isLoading !== null}
        >
          <Ionicons name="logo-google" size={24} color={colors.foreground} />
          <Text style={[styles.socialText, { color: colors.foreground }]}>
            {isLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.socialButton, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border, borderWidth: 1, opacity: 0.5 }]}
          disabled={true}
        >
          <Ionicons name="logo-apple" size={24} color={colors.foreground} />
          <Text style={[styles.socialText, { color: colors.foreground }]}>Continue with Apple (Coming Soon)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.socialButton, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border, borderWidth: 1, opacity: 0.5 }]}
          disabled={true}
        >
          <Ionicons name="mail" size={24} color={colors.foreground} />
          <Text style={[styles.socialText, { color: colors.foreground }]}>Continue with Email (Coming Soon)</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <SecondaryButton 
          title="Continue as Guest" 
          onPress={handleGuestLogin}
          loading={isLoading === 'guest'}
          disabled={isLoading !== null}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl * 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  form: {
    gap: SPACING.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    height: 56,
    gap: SPACING.md,
  },
  socialText: {
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginHorizontal: SPACING.md,
    textTransform: 'uppercase',
  }
});
