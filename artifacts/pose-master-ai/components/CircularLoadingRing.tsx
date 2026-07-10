/**
 * CircularLoadingRing
 * ===================
 * Smooth indeterminate circular progress spinner using react-native-svg
 * and react-native-reanimated. No timers, no fake progress.
 *
 * Uses a rotating partial arc (270°) driven by Reanimated on the UI thread
 * for zero JS-thread jank.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface CircularLoadingRingProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

/**
 * Indeterminate circular spinner.
 *
 * @param size         Outer diameter in dp (default 52)
 * @param strokeWidth  Ring thickness in dp (default 3)
 * @param color        Arc colour (default #FFD54F)
 * @param trackColor   Background ring colour (default rgba(255,255,255,0.12))
 */
export const CircularLoadingRing: React.FC<CircularLoadingRingProps> = ({
  size = 52,
  strokeWidth = 3,
  color = '#FFD54F',
  trackColor = 'rgba(255,255,255,0.12)',
}) => {
  const rotation = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Show ~270° of arc (75% filled, 25% gap for classic spinner look)
  const arcLength = circumference * 0.75;
  const gapLength = circumference * 0.25;

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1100, easing: Easing.linear }),
      -1, // infinite
    );
    return () => cancelAnimation(rotation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, spinStyle]}>
      <Svg width={size} height={size}>
        {/* Track ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Spinning arc — starts at 12 o'clock (-90° rotation built in) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
          // rotate so the gap starts at the bottom-right (feels natural)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // (no static styles needed — all sizing is prop-driven)
  _placeholder: {},
});
