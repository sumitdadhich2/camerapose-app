/**
 * PackAwareCategoryCard
 * =====================
 * Category card that automatically handles pose pack loading state.
 *
 * Visual states:
 *   cached      → Normal card, tappable immediately.
 *   not_cached  → Normal card (tap auto-triggers download then opens).
 *   downloading → Card dimmed + spinning circular ring overlay. Disabled.
 *   failed      → Card normal + small retry badge. Tap retries download.
 *
 * The card never shows download buttons, URLs, or technical language.
 */

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import { usePosePackStore, type CategoryPackState } from '../store/usePosePackStore';
import { CircularLoadingRing } from './CircularLoadingRing';

interface PackAwareCategoryCardProps {
  categoryId: string;
  name: string;
  icon: string;
  count: number;
  onPress: () => void;
  style?: object;
}

export const PackAwareCategoryCard: React.FC<PackAwareCategoryCardProps> = ({
  categoryId,
  name,
  icon,
  count,
  onPress,
  style,
}) => {
  const colors = useColors();
  const packState: CategoryPackState | undefined = usePosePackStore(
    (s) => s.packs[categoryId],
  );

  const status = packState?.status ?? 'not_cached';
  const isDownloading = status === 'downloading';
  const isFailed = status === 'failed';
  const isDisabled = isDownloading;

  // ── Animations ──────────────────────────────────────────────────────────────

  // Dim the content while downloading
  const contentOpacity = useSharedValue(1);
  // Retry badge scale for entrance pop
  const retryScale = useSharedValue(0);
  // Press scale feedback
  const pressScale = useSharedValue(1);

  useEffect(() => {
    contentOpacity.value = withTiming(isDownloading ? 0.45 : 1, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
  }, [isDownloading]);

  useEffect(() => {
    retryScale.value = withSpring(isFailed ? 1 : 0, {
      damping: 14,
      stiffness: 200,
    });
  }, [isFailed]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const retryBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: retryScale.value }],
  }));

  const pressAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    pressScale.value = withSpring(0.94, { damping: 12 }, () => {
      pressScale.value = withSpring(1, { damping: 12 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [isDisabled, onPress]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Animated.View style={pressAnimStyle}>
      <TouchableOpacity
        activeOpacity={isDisabled ? 1 : 0.85}
        onPress={handlePress}
        disabled={isDisabled}
        style={[
          styles.container,
          { backgroundColor: colors.card, borderRadius: colors.radius as number },
          style,
        ]}
      >
        {/* ── Card content ── */}
        <Animated.View style={[styles.content, contentStyle]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.secondary, borderRadius: colors.radius as number },
            ]}
          >
            <Ionicons name={icon as any} size={28} color={colors.foreground} />
          </View>
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {count} templates
          </Text>
        </Animated.View>

        {/* ── Downloading overlay ── */}
        {isDownloading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <CircularLoadingRing size={54} strokeWidth={3} color={colors.primary} />
            {packState?.loadingMessage ? (
              <Text style={[styles.loadingMessage, { color: 'rgba(255,255,255,0.7)' }]}>
                {packState.loadingMessage}
              </Text>
            ) : null}
          </View>
        )}

        {/* ── Retry badge (failed state) ── */}
        {isFailed && (
          <Animated.View
            style={[styles.retryBadge, { backgroundColor: '#E57373' }, retryBadgeStyle]}
            pointerEvents="none"
          >
            <Ionicons name="refresh" size={12} color="#fff" />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    minHeight: 110,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: 2,
    textAlign: 'center',
  },
  count: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: SPACING.xs,
  },
  loadingMessage: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.2,
    paddingHorizontal: 4,
  },

  // Retry badge
  retryBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
