import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useOverlayStore } from '../../store/useOverlayStore';
import { getSvgOutline } from '../overlay/svgOutlines';

interface PoseOverlayLayerProps {
  poseOutlineKey: string;
}

/**
 * PoseOverlayLayer
 *
 * Renders the selected SVG pose outline above the live camera preview and
 * exposes drag / pinch-zoom / two-finger-rotate / double-tap-reset /
 * long-press-lock gestures directly on the overlay. All transform state
 * (scale, rotation, position, opacity, locked, visible) lives in
 * `useOverlayStore` so it persists across app restarts.
 */
export const PoseOverlayLayer: React.FC<PoseOverlayLayerProps> = ({ poseOutlineKey }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const {
    scale, rotation, x, y, opacity, locked, visible,
    setScale, setRotation, setPosition, resetPosition, resetRotation, resetSize, toggleLocked,
  } = useOverlayStore();

  const OutlineComponent = getSvgOutline(poseOutlineKey);

  // Shared values mirror the store for smooth 60fps gesture-driven updates.
  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const liveScale = useSharedValue(scale);
  const liveRotation = useSharedValue(rotation);
  const liveX = useSharedValue(x);
  const liveY = useSharedValue(y);

  useEffect(() => {
    liveScale.value = scale;
    liveRotation.value = rotation;
    liveX.value = x;
    liveY.value = y;
  }, [scale, rotation, x, y]);

  const commitTransform = (s: number, r: number, px: number, py: number) => {
    setScale(s);
    setRotation(r);
    setPosition(px, py);
  };

  const panGesture = Gesture.Pan()
    .enabled(!locked)
    .onStart(() => {
      savedX.value = liveX.value;
      savedY.value = liveY.value;
    })
    .onUpdate((e) => {
      liveX.value = savedX.value + e.translationX;
      liveY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(commitTransform)(liveScale.value, liveRotation.value, liveX.value, liveY.value);
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(!locked)
    .onStart(() => {
      savedScale.value = liveScale.value;
    })
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      liveScale.value = Math.max(0.4, Math.min(2.5, next));
    })
    .onEnd(() => {
      runOnJS(commitTransform)(liveScale.value, liveRotation.value, liveX.value, liveY.value);
    });

  const rotateGesture = Gesture.Rotation()
    .enabled(!locked)
    .onStart(() => {
      savedRotation.value = liveRotation.value;
    })
    .onUpdate((e) => {
      liveRotation.value = savedRotation.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      runOnJS(commitTransform)(liveScale.value, liveRotation.value, liveX.value, liveY.value);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(!locked)
    .onEnd(() => {
      liveScale.value = withSpring(1);
      liveRotation.value = withSpring(0);
      liveX.value = withSpring(0);
      liveY.value = withSpring(0);
      runOnJS(resetPosition)();
      runOnJS(resetRotation)();
      runOnJS(resetSize)();
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      runOnJS(toggleLocked)();
      runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
    });

  const composedOverlayGesture = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, longPressGesture),
    Gesture.Simultaneous(panGesture, pinchGesture, rotateGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity,
    transform: [
      { translateX: liveX.value },
      { translateY: liveY.value },
      { scale: liveScale.value },
      { rotate: `${liveRotation.value}deg` },
    ],
  }));

  if (!visible) {
    return null;
  }

  const outlineSize = Math.min(screenWidth, screenHeight) * 0.6;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={locked ? 'none' : 'box-none'}>
      <GestureDetector gesture={composedOverlayGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={[styles.outlineWrapper, locked && styles.outlineWrapperLocked]}>
            <OutlineComponent
              width={outlineSize}
              height={outlineSize * 1.6}
              color={locked ? 'rgba(76, 175, 80, 0.6)' : 'rgba(255, 213, 79, 0.5)'}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineWrapperLocked: {
    opacity: 0.95,
  },
});
