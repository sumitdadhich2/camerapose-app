import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useOverlayStore, OVERLAY_LIMITS } from '../../store/useOverlayStore';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';

const OPACITY_STOPS = [0, 0.25, 0.5, 0.75, 1];
const TRACK_WIDTH = 220;
const THUMB_SIZE = 24;

function IconButton({
  name,
  onPress,
  active,
  size = 20,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  active?: boolean;
  size?: number;
}) {
  return (
    <TouchableOpacity
      style={[styles.iconBtn, active && styles.iconBtnActive]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Ionicons name={name} size={size} color={active ? '#000' : '#FFD54F'} />
    </TouchableOpacity>
  );
}

function GlassOpacitySlider() {
  const { opacity, setOpacity } = useOverlayStore();
  const thumbX = useSharedValue(opacity * (TRACK_WIDTH - THUMB_SIZE));
  const startX = useSharedValue(0);

  const commit = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    setOpacity(clamped);
  };

  const snapToNearestStop = (value: number) => {
    let nearest = OPACITY_STOPS[0];
    let bestDiff = Math.abs(value - nearest);
    for (const stop of OPACITY_STOPS) {
      const diff = Math.abs(value - stop);
      if (diff < bestDiff) {
        nearest = stop;
        bestDiff = diff;
      }
    }
    return nearest;
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = thumbX.value;
    })
    .onUpdate((e) => {
      const next = Math.max(0, Math.min(TRACK_WIDTH - THUMB_SIZE, startX.value + e.translationX));
      thumbX.value = next;
      const ratio = next / (TRACK_WIDTH - THUMB_SIZE);
      runOnJS(commit)(ratio);
    })
    .onEnd(() => {
      const ratio = thumbX.value / (TRACK_WIDTH - THUMB_SIZE);
      const snapped = snapToNearestStop(ratio);
      thumbX.value = withSpring(snapped * (TRACK_WIDTH - THUMB_SIZE));
      runOnJS(commit)(snapped);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  return (
    <View style={styles.sliderWrap}>
      <View style={styles.sliderRow}>
        <Ionicons name="contrast-outline" size={16} color="#FFD54F" />
        <Text style={styles.sliderLabel}>Opacity</Text>
        <Text style={styles.sliderValue}>{Math.round(opacity * 100)}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.trackFill, fillStyle]} />
        <View style={styles.stopsRow} pointerEvents="none">
          {OPACITY_STOPS.map((stop) => (
            <View key={stop} style={styles.stopDot} />
          ))}
        </View>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </GestureDetector>
      </View>
    </View>
  );
}

export function OverlayControls() {
  const [expanded, setExpanded] = useState(false);
  const {
    increaseSize, decreaseSize, rotateLeft, rotateRight,
    moveUp, moveDown, moveLeft, moveRight,
    resetPosition, resetRotation, resetSize,
    locked, toggleLocked, visible, toggleVisible,
  } = useOverlayStore();

  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.fabToggle}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setExpanded(true);
        }}
        activeOpacity={0.8}
      >
        <BlurView intensity={40} tint="dark" style={styles.fabToggleInner}>
          <Ionicons name="options" size={22} color="#FFD54F" />
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <BlurView intensity={40} tint="dark" style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Overlay Controls</Text>
        <TouchableOpacity onPress={() => setExpanded(false)} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <GlassOpacitySlider />

      <View style={styles.row}>
        <IconButton name="remove-circle-outline" onPress={decreaseSize} />
        <Text style={styles.rowLabel}>Size</Text>
        <IconButton name="add-circle-outline" onPress={increaseSize} />

        <View style={styles.divider} />

        <IconButton name="arrow-undo-outline" onPress={rotateLeft} />
        <Text style={styles.rowLabel}>Rotate</Text>
        <IconButton name="arrow-redo-outline" onPress={rotateRight} />
      </View>

      <View style={styles.dpadRow}>
        <View style={styles.dpad}>
          <View style={styles.dpadTopRow}>
            <IconButton name="chevron-up" onPress={moveUp} size={18} />
          </View>
          <View style={styles.dpadMidRow}>
            <IconButton name="chevron-back" onPress={moveLeft} size={18} />
            <IconButton name="locate-outline" onPress={() => { resetPosition(); }} size={16} />
            <IconButton name="chevron-forward" onPress={moveRight} size={18} />
          </View>
          <View style={styles.dpadBotRow}>
            <IconButton name="chevron-down" onPress={moveDown} size={18} />
          </View>
        </View>

        <View style={styles.resetColumn}>
          <TouchableOpacity style={styles.resetChip} onPress={resetPosition}>
            <Text style={styles.resetChipText}>Reset Position</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetChip} onPress={resetRotation}>
            <Text style={styles.resetChipText}>Reset Rotation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetChip} onPress={resetSize}>
            <Text style={styles.resetChipText}>Reset Size</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.pillBtn, locked && styles.pillBtnActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleLocked(); }}
        >
          <Ionicons name={locked ? 'lock-closed' : 'lock-open-outline'} size={16} color={locked ? '#000' : '#FFD54F'} />
          <Text style={[styles.pillBtnText, locked && styles.pillBtnTextActive]}>{locked ? 'Locked' : 'Unlocked'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillBtn, !visible && styles.pillBtnActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleVisible(); }}
        >
          <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={16} color={!visible ? '#000' : '#FFD54F'} />
          <Text style={[styles.pillBtnText, !visible && styles.pillBtnTextActive]}>{visible ? 'Visible' : 'Hidden'}</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  fabToggle: {
    position: 'absolute',
    right: SPACING.md,
    top: '38%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabToggleInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,213,79,0.4)',
  },
  panel: {
    position: 'absolute',
    right: SPACING.md,
    top: '12%',
    width: 260,
    borderRadius: 24,
    padding: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,213,79,0.25)',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  panelTitle: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderWrap: {
    marginBottom: SPACING.md,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sliderLabel: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
  },
  sliderValue: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  track: {
    width: TRACK_WIDTH,
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  trackFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD54F',
    left: 0,
  },
  stopsRow: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stopDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFD54F',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 10,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,213,79,0.12)',
  },
  iconBtnActive: {
    backgroundColor: '#FFD54F',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dpad: {
    alignItems: 'center',
  },
  dpadTopRow: {
    flexDirection: 'row',
  },
  dpadMidRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dpadBotRow: {
    flexDirection: 'row',
  },
  resetColumn: {
    gap: 6,
  },
  resetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  resetChipText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 10,
  },
  footerRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,213,79,0.12)',
  },
  pillBtnActive: {
    backgroundColor: '#FFD54F',
  },
  pillBtnText: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 11,
  },
  pillBtnTextActive: {
    color: '#000',
  },
});
