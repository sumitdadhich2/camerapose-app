import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRecentStore } from '../../store/useRecentStore';
import * as Haptics from 'expo-haptics';

export default function CameraPlaceholderScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { addRecentTemplate } = useRecentStore();

  useEffect(() => {
    if (id && typeof id === 'string') {
      addRecentTemplate(id);
    }
  }, [id]);

  const handleCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="flash-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="camera-reverse-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.viewport}>
        <View style={styles.poseOutline}>
          <Ionicons name="body-outline" size={200} color="rgba(255, 213, 79, 0.4)" />
        </View>
        <View style={[styles.instructionBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.instructionText, { color: colors.foreground }]}>Fit body inside the gold outline</Text>
        </View>
      </View>

      <View style={styles.bottomControls}>
        <View style={styles.settingsRow}>
          <TouchableOpacity style={styles.smallIconButton}>
            <Ionicons name="timer-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallIconButton}>
            <Ionicons name="options-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.captureRow}>
          <TouchableOpacity style={styles.galleryButton}>
            <Ionicons name="images" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.captureButton, { borderColor: colors.primary }]} onPress={handleCapture}>
            <View style={[styles.captureInner, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryButton}>
            <Ionicons name="videocam-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    zIndex: 10,
  },
  iconButton: {
    padding: SPACING.sm,
  },
  viewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  poseOutline: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 213, 79, 0.2)',
    borderStyle: 'dashed',
    width: '80%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionBadge: {
    position: 'absolute',
    top: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    opacity: 0.9,
  },
  instructionText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  bottomControls: {
    paddingBottom: 40,
    paddingHorizontal: SPACING.xl,
    backgroundColor: '#000000',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  smallIconButton: {
    padding: SPACING.xs,
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  }
});