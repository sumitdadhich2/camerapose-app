import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { PoseTemplate, Category } from '../../types';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import { getSvgOutline } from '../overlay/svgOutlines';

interface Props {
  currentPoseId: string | undefined;
  captureControlsHeight: number;
  onPoseInfoRequest: (pose: PoseTemplate) => void;
  onStartGuide: () => void;
}

const { width: SCREEN_W } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 148;
const EXPANDED_HEIGHT = 470;
const DRAG_RANGE = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#4CAF50',
  medium: '#FFB74D',
  hard: '#EF5350',
};

export const CameraPoseBottomSheet: React.FC<Props> = ({
  currentPoseId,
  captureControlsHeight,
  onPoseInfoRequest,
  onStartGuide,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    const allCategories = PoseLibraryService.getAllCategories();
    return allCategories[0]?.id ?? 'c1';
  });

  const currentPose = currentPoseId ? PoseLibraryService.getPoseById(currentPoseId) : undefined;
  const currentCategory = currentPose ? PoseLibraryService.getCategoryById(currentPose.categoryId) : undefined;
  const allCategories = PoseLibraryService.getAllCategories();
  const posesInCategory = PoseLibraryService.getPosesByCategory(selectedCategoryId);

  // translateY: 0 = expanded (full EXPANDED_HEIGHT visible above capture controls)
  //              DRAG_RANGE = collapsed (only COLLAPSED_HEIGHT visible)
  const translateY = useSharedValue(DRAG_RANGE);
  const startY = useSharedValue(DRAG_RANGE);

  const collapse = useCallback(() => {
    'worklet';
    translateY.value = withSpring(DRAG_RANGE, { damping: 22, stiffness: 200 });
    runOnJS(setIsExpanded)(false);
  }, []);

  const expand = useCallback(() => {
    'worklet';
    translateY.value = withSpring(0, { damping: 22, stiffness: 200 });
    runOnJS(setIsExpanded)(true);
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = Math.max(0, Math.min(DRAG_RANGE, startY.value + e.translationY));
      translateY.value = next;
    })
    .onEnd((e) => {
      if (e.velocityY > 600 || translateY.value > DRAG_RANGE * 0.5) {
        collapse();
      } else {
        expand();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleToggle = () => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  };

  return (
    <Animated.View
      style={[
        styles.sheet,
        { bottom: captureControlsHeight, height: EXPANDED_HEIGHT },
        animatedStyle,
      ]}
    >
      <BlurView intensity={70} tint="dark" style={styles.blur}>
        {/* Drag Handle */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        {/* Collapsed Content — always visible (top COLLAPSED_HEIGHT) */}
        <View style={styles.collapsedContent}>
          <View style={styles.collapsedTop}>
            <View style={styles.poseInfoBlock}>
              <Text style={styles.poseName} numberOfLines={1}>
                {currentPose?.title ?? 'Select a Pose'}
              </Text>
              <View style={styles.poseMetaRow}>
                {currentCategory && (
                  <View style={styles.metaChip}>
                    <Ionicons name={currentCategory.icon as any} size={11} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.metaChipText}>{currentCategory.name}</Text>
                  </View>
                )}
                {currentPose && (
                  <View style={styles.metaChip}>
                    <Ionicons name="resize" size={11} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.metaChipText}>{currentPose.recommendedDistance}</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.changePoseBtn} onPress={handleToggle} activeOpacity={0.8}>
              <Text style={styles.changePoseBtnText}>Change</Text>
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-up'}
                size={14}
                color="#000"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startGuideBtn} onPress={onStartGuide} activeOpacity={0.85}>
            <Ionicons name="play-circle-outline" size={18} color="#000" />
            <Text style={styles.startGuideBtnText}>Start Pose Guide</Text>
          </TouchableOpacity>
        </View>

        {/* Expanded Content — categories + carousel */}
        <View style={[styles.expandedContent, { height: EXPANDED_HEIGHT - COLLAPSED_HEIGHT }]}>
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsRow}
          >
            {allCategories.map((cat) => (
              <CategoryTab
                key={cat.id}
                category={cat}
                isSelected={selectedCategoryId === cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
              />
            ))}
          </ScrollView>

          {/* Pose Cards */}
          {posesInCategory.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={posesInCategory}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.poseCarousel}
              renderItem={({ item }) => (
                <PoseCardMini
                  pose={item}
                  isActive={item.id === currentPoseId}
                  onPress={() => onPoseInfoRequest(item)}
                />
              )}
            />
          ) : (
            <View style={styles.emptyPoses}>
              <Text style={styles.emptyPosesText}>No poses in this category yet</Text>
            </View>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const CategoryTab: React.FC<{
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}> = ({ category, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Ionicons
      name={category.icon as any}
      size={14}
      color={isSelected ? '#000' : 'rgba(255,255,255,0.6)'}
    />
    <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

const PoseCardMini: React.FC<{
  pose: PoseTemplate;
  isActive: boolean;
  onPress: () => void;
}> = ({ pose, isActive, onPress }) => {
  const OutlineSvg = getSvgOutline(pose.svgOutline);
  const diffColor = DIFFICULTY_COLOR[pose.difficulty] ?? '#FFB74D';

  return (
    <TouchableOpacity
      style={[styles.poseCard, isActive && styles.poseCardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* SVG Preview */}
      <View style={[styles.poseCardPreview, { backgroundColor: pose.previewImage + '22' }]}>
        <OutlineSvg width={70} height={90} color={pose.previewImage} />
        {pose.premium && (
          <View style={styles.miniPremiumBadge}>
            <Text style={styles.miniPremiumText}>PRO</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <Text style={styles.poseCardName} numberOfLines={2}>{pose.title}</Text>
      <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,213,79,0.25)',
    zIndex: 30,
  },
  blur: {
    flex: 1,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  collapsedContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  collapsedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  poseInfoBlock: {
    flex: 1,
  },
  poseName: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 4,
  },
  poseMetaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaChipText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  changePoseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFD54F',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 12,
  },
  changePoseBtnText: {
    color: '#000',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  startGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,213,79,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,213,79,0.4)',
    paddingVertical: 11,
    borderRadius: 14,
  },
  startGuideBtnText: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.semiBold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  expandedContent: {
    overflow: 'hidden',
  },
  categoryTabsRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  categoryTabActive: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFD54F',
  },
  categoryTabText: {
    color: 'rgba(255,255,255,0.65)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  categoryTabTextActive: {
    color: '#000',
    fontFamily: TYPOGRAPHY.weights.semiBold,
  },
  poseCarousel: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    gap: SPACING.sm,
  },
  poseCard: {
    width: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 6,
    alignItems: 'center',
  },
  poseCardActive: {
    borderColor: '#FFD54F',
    backgroundColor: 'rgba(255,213,79,0.12)',
  },
  poseCardPreview: {
    width: 98,
    height: 110,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  miniPremiumBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFD54F',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  miniPremiumText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: 9,
    color: '#000',
  },
  poseCardName: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 15,
  },
  diffDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  emptyPoses: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyPosesText: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
