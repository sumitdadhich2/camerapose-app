import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useGuideStore } from '../../store/useGuideStore';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

export const FloatingGuidePanel: React.FC = () => {
  const { isActive, currentStep, steps, poseTitle, nextStep, prevStep, deactivateGuide } = useGuideStore();

  if (!isActive || steps.length === 0) return null;

  const totalSteps = steps.length;
  const stepText = steps[currentStep] ?? '';
  const isLast = currentStep === totalSteps - 1;
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      exiting={FadeOutDown.duration(250)}
      style={styles.container}
    >
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.activeDot} />
            <Text style={styles.poseLabel} numberOfLines={1}>{poseTitle}</Text>
          </View>
          <TouchableOpacity onPress={deactivateGuide} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
        </View>

        {/* Step counter */}
        <View style={styles.stepRow}>
          <Text style={styles.stepCounter}>Step {currentStep + 1} / {totalSteps}</Text>
          {isLast && (
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectText}>Perfect ✓</Text>
            </View>
          )}
        </View>

        {/* Step text */}
        <Text style={styles.stepText}>{stepText}</Text>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentStep === 0 && styles.navBtnDisabled]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Ionicons name="chevron-back" size={16} color={currentStep === 0 ? 'rgba(255,255,255,0.3)' : '#FFD54F'} />
            <Text style={[styles.navBtnText, currentStep === 0 && styles.navBtnTextDisabled]}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnNext, isLast && styles.navBtnDone]}
            onPress={isLast ? deactivateGuide : nextStep}
          >
            <Text style={[styles.navBtnText, styles.navBtnTextNext]}>{isLast ? 'Done' : 'Next'}</Text>
            {!isLast && <Ionicons name="chevron-forward" size={16} color="#000" />}
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 220,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 79, 0.25)',
    zIndex: 50,
  },
  blur: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  poseLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD54F',
    borderRadius: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepCounter: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.5,
  },
  perfectBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.4)',
  },
  perfectText: {
    color: '#81C784',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  stepText: {
    color: '#ffffff',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  navRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnNext: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFD54F',
  },
  navBtnDone: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  navBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  navBtnTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  navBtnTextNext: {
    color: '#000',
  },
});
