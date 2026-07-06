import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useColors } from '../hooks/useColors';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuthStore } from '../store/useAuthStore';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, SlideInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Your Personal Coach',
    description: 'Master the art of photography with professional pose templates right in your pocket.',
    icon: 'camera-outline',
  },
  {
    id: '2',
    title: 'Perfect Alignment',
    description: 'Fit inside transparent outlines. The app guides you to capture the perfect moment.',
    icon: 'body-outline',
  },
  {
    id: '3',
    title: 'Offline Ready',
    description: 'No internet? No problem. Use all templates anywhere, anytime.',
    icon: 'planet-outline',
  }
];

export default function OnboardingScreen() {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const setHasSeenOnboarding = useAuthStore(s => s.setHasSeenOnboarding);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    router.replace('/login');
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.skipContainer}>
        {currentIndex < SLIDES.length - 1 && (
          <Text 
            style={[styles.skipText, { color: colors.mutedForeground }]} 
            onPress={handleSkip}
          >
            Skip
          </Text>
        )}
      </View>

      <Animated.View 
        key={slide.id}
        entering={FadeInRight.duration(400)}
        style={styles.content}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary, borderRadius: colors.radius * 2 }]}>
          <Ionicons name={slide.icon as any} size={80} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{slide.title}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{slide.description}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: index === currentIndex ? colors.primary : colors.muted },
                index === currentIndex && styles.activeDot
              ]} 
            />
          ))}
        </View>
        <PrimaryButton 
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"} 
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
  },
  skipContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 40,
  },
  skipText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxxl,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  description: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    paddingBottom: SPACING.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  button: {
    width: '100%',
  }
});
