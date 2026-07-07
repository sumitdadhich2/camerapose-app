import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '../../constants/theme';
import { useGuideStore } from '../../store/useGuideStore';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/** How long each instruction is displayed before auto-advancing (ms). */
const STEP_DURATION_MS = 3500;
/** How long to linger on the final "Perfect Pose" chip before auto-dismissing. */
const FINAL_STEP_LINGER_MS = 2200;

/**
 * FloatingGuidePanel — a single floating instruction chip.
 *
 * Shows exactly ONE instruction at a time. Instructions auto-cycle
 * every STEP_DURATION_MS. The final step lingers briefly then
 * dismisses. The user can dismiss at any time with the ✕ button.
 *
 * All timers are tracked and cleared on cleanup — no stale callbacks.
 */
export const FloatingGuidePanel: React.FC = () => {
  const { isActive, currentStep, steps, deactivateGuide } = useGuideStore();
  const textOpacity = useSharedValue(1);

  /**
   * Single ref holding the currently active timer so cleanup is always
   * deterministic — only one timer is ever live at a time.
   */
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Fade in each new instruction
  useEffect(() => {
    textOpacity.value = 0;
    textOpacity.value = withTiming(1, { duration: 380 });
  }, [currentStep]);

  /**
   * Auto-advance / auto-dismiss effect.
   *
   * Runs whenever isActive or currentStep changes so the countdown always
   * resets cleanly. Cleanup cancels any in-flight timer before scheduling
   * a new one, preventing bleed-through across step transitions and
   * preventing fire-after-unmount issues.
   */
  useEffect(() => {
    if (!isActive || steps.length === 0) {
      clearTimer();
      return;
    }

    const isLast = currentStep >= steps.length - 1;
    const delay = isLast ? FINAL_STEP_LINGER_MS : STEP_DURATION_MS;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const state = useGuideStore.getState();
      if (!state.isActive) return; // already dismissed externally
      if (isLast) {
        state.deactivateGuide();
      } else {
        state.nextStep();
      }
    }, delay);

    return clearTimer;
  }, [isActive, currentStep, steps.length]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  if (!isActive || steps.length === 0) return null;

  const instruction = steps[currentStep] ?? '';
  const isLast = currentStep === steps.length - 1;

  const chipContent = (
    <View style={styles.row}>
      {isLast && (
        <View style={styles.checkDot}>
          <Ionicons name="checkmark" size={12} color="#000" />
        </View>
      )}
      <Animated.Text
        style={[styles.instructionText, fadeStyle]}
        numberOfLines={1}
      >
        {instruction}
      </Animated.Text>
      <TouchableOpacity
        onPress={deactivateGuide}
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={13} color="rgba(255,255,255,0.45)" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      exiting={FadeOut.duration(220)}
      style={styles.container}
    >
      {Platform.OS !== 'web' ? (
        <BlurView intensity={55} tint="dark" style={styles.blurWrap}>
          {chipContent}
        </BlurView>
      ) : (
        <View style={[styles.blurWrap, styles.webFallback]}>
          {chipContent}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 290,
    alignSelf: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 79, 0.28)',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 40,
    maxWidth: 320,
    minWidth: 160,
  },
  blurWrap: {
    borderRadius: 100,
  },
  webFallback: {
    backgroundColor: 'rgba(10, 10, 10, 0.92)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 14,
    gap: 8,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  instructionText: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.md,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
