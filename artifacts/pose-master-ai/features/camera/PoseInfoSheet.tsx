import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Dimensions, Animated, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { PoseTemplate } from '../../types';
import { getSvgOutline } from '../overlay/svgOutlines';

interface Props {
  pose: PoseTemplate | null;
  visible: boolean;
  onClose: () => void;
  onStartGuide: (pose: PoseTemplate) => void;
}

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.88;

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#4CAF50',
  medium: '#FFB74D',
  hard: '#EF5350',
};

export const PoseInfoSheet: React.FC<Props> = ({ pose, visible, onClose, onStartGuide }) => {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!pose) return null;

  const OutlineSvg = getSvgOutline(pose.svgOutline);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.backdropInner} />
      </TouchableOpacity>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {Platform.OS !== 'web' ? (
          <BlurView intensity={80} tint="dark" style={styles.sheetBlur}>
            <SheetContent pose={pose} onClose={onClose} onStartGuide={onStartGuide} OutlineSvg={OutlineSvg} />
          </BlurView>
        ) : (
          <View style={[styles.sheetBlur, { backgroundColor: '#1a1a1a' }]}>
            <SheetContent pose={pose} onClose={onClose} onStartGuide={onStartGuide} OutlineSvg={OutlineSvg} />
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

const SheetContent: React.FC<{
  pose: PoseTemplate;
  onClose: () => void;
  onStartGuide: (p: PoseTemplate) => void;
  OutlineSvg: React.FC<{ width: number; height: number; color: string }>;
}> = ({ pose, onClose, onStartGuide, OutlineSvg }) => {
  const diffColor = DIFFICULTY_COLOR[pose.difficulty] ?? '#FFB74D';

  return (
    <View style={styles.sheetInner}>
      {/* Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={onClose} style={styles.headerCloseBtn}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.sheetTitle} numberOfLines={1}>{pose.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Preview */}
        <View style={[styles.previewBox, { backgroundColor: pose.previewImage + '30' }]}>
          <OutlineSvg width={140} height={220} color={pose.previewImage} />
          {pose.premium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={10} color="#000" />
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Chips row */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { borderColor: diffColor + '60', backgroundColor: diffColor + '18' }]}>
            <Text style={[styles.chipText, { color: diffColor }]}>{pose.difficulty.toUpperCase()}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="resize" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.chipText}>{pose.recommendedDistance}</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="camera" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.chipText}>{pose.recommendedHeight}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{pose.description}</Text>

        {/* Instructions */}
        <Text style={styles.sectionLabel}>Step-by-Step Instructions</Text>
        <View style={styles.instructionsList}>
          {pose.instructions.map((step, i) => (
            <View key={i} style={styles.instructionRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={11} color="#000" />
              </View>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        {pose.tips.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pro Tips</Text>
            {pose.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name="bulb-outline" size={14} color="#FFD54F" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footerArea}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => onStartGuide(pose)}
          activeOpacity={0.85}
        >
          <Ionicons name="play-circle" size={20} color="#000" />
          <Text style={styles.startBtnText}>Start Pose Guide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 91,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,213,79,0.2)',
  },
  sheetBlur: {
    flex: 1,
  },
  sheetInner: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  previewBox: {
    alignSelf: 'center',
    width: 200,
    height: 260,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFD54F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: 10,
    color: '#000',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  description: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.sm,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: 4,
  },
  instructionsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 22,
    flex: 1,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tipText: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  footerArea: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFD54F',
    paddingVertical: 16,
    borderRadius: 16,
  },
  startBtnText: {
    color: '#000',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    letterSpacing: 0.3,
  },
});
