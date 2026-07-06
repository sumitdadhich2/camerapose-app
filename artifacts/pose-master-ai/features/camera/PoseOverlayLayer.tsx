import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface PoseOverlayLayerProps {
  opacity?: number;
  scale?: number;
  rotation?: number;
  locked?: boolean;
}

/**
 * PoseOverlayLayer
 * 
 * Architecture for future SVG pose templates.
 * Currently renders a static placeholder outline, but is wired
 * with reanimated shared values to support future drag gestures
 * and AI-driven alignment updates.
 */
export const PoseOverlayLayer: React.FC<PoseOverlayLayerProps> = ({
  opacity = 1,
  scale = 1,
  rotation = 0,
  locked = false,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(opacity),
      transform: [
        { scale: withSpring(scale) },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={[styles.poseOutline, locked && styles.poseOutlineLocked]}>
          <Ionicons 
            name="body-outline" 
            size={240} 
            color={locked ? "rgba(76, 175, 80, 0.6)" : "rgba(255, 213, 79, 0.4)"} 
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poseOutline: {
    borderWidth: 2,
    borderColor: 'rgba(255, 213, 79, 0.3)',
    borderStyle: 'dashed',
    width: '85%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  poseOutlineLocked: {
    borderColor: 'rgba(76, 175, 80, 0.5)',
    borderStyle: 'solid',
  }
});
