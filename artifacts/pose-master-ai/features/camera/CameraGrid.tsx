import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CameraGridProps {
  visible: boolean;
}

export const CameraGrid: React.FC<CameraGridProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.horizontalLine, { top: '33.33%' }]} />
      <View style={[styles.horizontalLine, { top: '66.66%' }]} />
      <View style={[styles.verticalLine, { left: '33.33%' }]} />
      <View style={[styles.verticalLine, { left: '66.66%' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  verticalLine: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
