import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Image, ScrollView, FlatList, ListRenderItemInfo,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRecentStore } from '../../store/useRecentStore';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle, useSharedValue,
  withSpring, runOnJS, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PoseOverlayLayer } from '../../features/camera/PoseOverlayLayer';
import { CameraSettingsSheet } from '../../features/camera/CameraSettingsSheet';
import { PhotoReviewModal } from '../../features/camera/PhotoReviewModal';
import { CameraGrid } from '../../features/camera/CameraGrid';
import { PoseInfoSheet } from '../../features/camera/PoseInfoSheet';
import { useCameraSettingsStore } from '../../store/useCameraSettingsStore';
import { useCapturedPhotosStore } from '../../store/useCapturedPhotosStore';
import { useOverlayStore } from '../../store/useOverlayStore';
import { PoseLibraryService } from '../../services/PoseLibraryService';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PoseTemplate } from '../../types';
import { getSvgOutline } from '../../features/overlay/svgOutlines';

// ─── Sub-component defined at module level to avoid hook-order issues ────────

const PoseCardItem = React.memo<{
  pose: PoseTemplate;
  isActive: boolean;
  onPress: (pose: PoseTemplate) => void;
}>(({ pose, isActive, onPress }) => {
  const pressScale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const OutlineSvg = getSvgOutline(pose.svgOutline);

  const handlePress = () => {
    pressScale.value = withSequence(
      withTiming(0.92, { duration: 70 }),
      withSpring(1, { damping: 15 }),
    );
    onPress(pose);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[
        poseCardStyles.card,
        isActive && poseCardStyles.cardActive,
        animStyle,
      ]}>
        <View style={[poseCardStyles.preview, { backgroundColor: pose.previewImage + '22' }]}>
          <OutlineSvg width={54} height={70} color={pose.previewImage} />
          {pose.premium && (
            <View style={poseCardStyles.proBadge}>
              <Text style={poseCardStyles.proText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={poseCardStyles.name} numberOfLines={2}>{pose.title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const poseCardStyles = StyleSheet.create({
  card: {
    width: 88,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 5,
    alignItems: 'center',
  },
  cardActive: {
    borderColor: '#FFD54F',
    backgroundColor: 'rgba(255,213,79,0.08)',
  },
  preview: {
    width: 78,
    height: 96,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative',
  },
  proBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD54F',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: 8,
    color: '#000',
  },
  name: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 2,
    marginBottom: 3,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CameraScreen() {
  // ── All hooks unconditionally at the top ──────────────────────────────────
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { addRecentTemplate } = useRecentStore();
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const settings = useCameraSettingsStore();
  const { photos, loadPhotos } = useCapturedPhotosStore();
  const {
    loadState: loadOverlayState,
    setLastPoseId,
    resetPosition,
    setScale,
    setRotation,
  } = useOverlayStore();
  // Active pose
  const [activePoseId, setActivePoseId] = useState<string | undefined>(
    typeof id === 'string' ? id : undefined,
  );

  // Camera controls
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [zoom, setZoom] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [timer, setTimer] = useState<0 | 3 | 5 | 10>(0);

  // Grid toggle
  const [gridEnabled, setGridEnabled] = useState(settings.grid);

  // Category selection
  const allCategories = useMemo(() => PoseLibraryService.getAllCategories(), []);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    const initial = typeof id === 'string' ? PoseLibraryService.getPoseById(id) : undefined;
    return initial?.categoryId ?? allCategories[0]?.id ?? 'c1';
  });

  // Pose info sheet
  const [poseForInfo, setPoseForInfo] = useState<PoseTemplate | null>(null);
  const [showPoseInfo, setShowPoseInfo] = useState(false);

  // Animations — all defined unconditionally before any early return
  const captureScale = useSharedValue(1);
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusOpacity = useSharedValue(0);

  const captureAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  const focusAnimStyle = useAnimatedStyle(() => ({
    opacity: focusOpacity.value,
    transform: [
      { translateX: focusX.value - 25 },
      { translateY: focusY.value - 25 },
    ],
  }));

  // Derived values
  const activePose = useMemo(
    () => (activePoseId ? PoseLibraryService.getPoseById(activePoseId) : undefined),
    [activePoseId],
  );
  const outlineKey = activePose?.svgOutline ?? 'placeholder';
  const posesInCategory = useMemo(
    () => PoseLibraryService.getPosesByCategory(selectedCategoryId),
    [selectedCategoryId],
  );
  const lastPhoto = photos.length > 0 ? photos[0] : null;

  useEffect(() => {
    if (activePoseId) {
      addRecentTemplate(activePoseId);
      setLastPoseId(activePoseId);
    }
    loadPhotos();
    loadOverlayState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePoseId]);

  // ── Gestures ──────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch().onUpdate((e) => {
    const next = Math.max(0, Math.min(1, zoom + e.velocity / 1000));
    runOnJS(setZoom)(next);
  });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    focusX.value = e.x;
    focusY.value = e.y;
    focusOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 700 }),
      withTiming(0, { duration: 300 }),
    );
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  });

  const composed = Gesture.Simultaneous(pinchGesture, tapGesture);

  // ── Permission screens (early returns AFTER all hooks) ────────────────────
  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="camera" size={64} color={colors.primary} />
        <Text style={[styles.permTitle, { color: colors.foreground }]}>Camera Access Required</Text>
        <Text style={[styles.permText, { color: colors.mutedForeground }]}>
          Pose Master AI needs camera access so you can line yourself up with pose templates.
        </Text>
        <PrimaryButton title="Grant Permission" onPress={requestPermission} />
        <TouchableOpacity style={{ marginTop: SPACING.md }} onPress={() => router.back()}>
          <Text style={{ color: colors.mutedForeground, fontFamily: TYPOGRAPHY.weights.medium }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const cycleFlash = () => {
    setFlash(c => (c === 'off' ? 'auto' : c === 'auto' ? 'on' : 'off'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const cycleTimer = () => {
    setTimer(c => (c === 0 ? 3 : c === 3 ? 5 : c === 5 ? 10 : 0));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    captureScale.value = withSequence(
      withTiming(0.82, { duration: 90 }),
      withSpring(1, { damping: 14 }),
    );
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: settings.quality === 'High' ? 1 : settings.quality === 'Medium' ? 0.7 : 0.4,
      });
      if (photo) setReviewPhoto(photo.uri);
    } catch {
      if (Platform.OS === 'web') alert('Camera capture not supported in web preview');
    }
  };

  const getFlashIcon = (): React.ComponentProps<typeof Ionicons>['name'] => {
    if (flash === 'on') return 'flash';
    if (flash === 'auto') return 'flash-outline';
    return 'flash-off-outline';
  };

  const handlePoseCardPress = (pose: PoseTemplate) => {
    setPoseForInfo(pose);
    setShowPoseInfo(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Load a pose into the overlay — no fake guidance, no simulated instructions.
  // Real pose guidance will be driven by PoseDetectionService once connected.
  const handleStartGuide = (pose: PoseTemplate) => {
    setShowPoseInfo(false);
    setPoseForInfo(null);
    setActivePoseId(pose.id);
    addRecentTemplate(pose.id);
    setLastPoseId(pose.id);
    resetPosition();
    setScale(1);
    setRotation(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderPoseCard = ({ item }: ListRenderItemInfo<PoseTemplate>) => (
    <PoseCardItem
      pose={item}
      isActive={item.id === activePoseId}
      onPress={handlePoseCardPress}
    />
  );

  const bottomSectionPaddingBottom = Math.max(insets.bottom, 8);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={styles.root}>

      {/* ── Web fallback ── */}
      {Platform.OS === 'web' && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.webFallback}>
            <Ionicons name="camera-outline" size={56} color="#333" />
            <Text style={styles.webFallbackText}>Camera preview requires Expo Go on a device.</Text>
          </View>
          <PoseOverlayLayer poseOutlineKey={outlineKey} />
          <TouchableOpacity style={[styles.webBack, { top: Math.max(insets.top + 12, 56) }]} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Native camera — fills entire screen ── */}
      {Platform.OS !== 'web' && (
        <GestureDetector gesture={composed}>
          <View style={StyleSheet.absoluteFill}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              flash={flash}
              zoom={zoom}
              animateShutter={false}
              mirror={settings.mirrorSelfie && facing === 'front'}
            />
            <CameraGrid visible={gridEnabled} />
            <PoseOverlayLayer poseOutlineKey={outlineKey} />
            <Animated.View style={[styles.focusRing, focusAnimStyle]} />
          </View>
        </GestureDetector>
      )}

      {/* ── Top Bar ── */}
      <BlurView
        intensity={Platform.OS === 'web' ? 0 : 30}
        tint="dark"
        style={[styles.topBar, { paddingTop: Math.max(insets.top + 6, 20) }]}
      >
        {/* Back */}
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Center controls */}
        <View style={styles.topCenter}>
          {/* Flash */}
          <TouchableOpacity style={styles.topBtn} onPress={cycleFlash}>
            <Ionicons name={getFlashIcon()} size={22} color={flash !== 'off' ? '#FFD54F' : 'rgba(255,255,255,0.7)'} />
          </TouchableOpacity>

          {/* Timer */}
          <TouchableOpacity style={styles.topBtn} onPress={cycleTimer}>
            {timer === 0 ? (
              <Ionicons name="timer-outline" size={22} color="rgba(255,255,255,0.4)" />
            ) : (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{timer}s</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Grid */}
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => setGridEnabled(g => !g)}
          >
            <Ionicons
              name="grid-outline"
              size={22}
              color={gridEnabled ? '#FFD54F' : 'rgba(255,255,255,0.4)'}
            />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <TouchableOpacity style={styles.topBtn} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </BlurView>

      {/* ── Bottom Section: capture + categories + poses ── */}
      <View style={[styles.bottomSection, { paddingBottom: bottomSectionPaddingBottom }]}>

        {/* Capture row */}
        <View style={styles.captureRow}>
          {/* Gallery */}
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => router.push('/(tabs)/gallery')}
          >
            {lastPhoto ? (
              <Image source={{ uri: lastPhoto.uri }} style={styles.galleryThumb} />
            ) : (
              <Ionicons name="images-outline" size={26} color="rgba(255,255,255,0.7)" />
            )}
          </TouchableOpacity>

          {/* Capture */}
          <Animated.View style={captureAnimStyle}>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
              activeOpacity={0.9}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </Animated.View>

          {/* Flip */}
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => {
              setFacing(f => (f === 'back' ? 'front' : 'back'));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Category selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {allCategories.map(cat => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryTab}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
                  {cat.name}
                </Text>
                {isSelected && <View style={styles.categoryIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Pose cards */}
        {posesInCategory.length > 0 ? (
          <FlatList
            horizontal
            data={posesInCategory}
            keyExtractor={item => item.id}
            renderItem={renderPoseCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.poseRow}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
          />
        ) : (
          <View style={styles.emptyPoses}>
            <Text style={styles.emptyPosesText}>No poses in this category yet</Text>
          </View>
        )}
      </View>

      {/* ── Modals ── */}
      <CameraSettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />

      <PhotoReviewModal
        photoUri={reviewPhoto}
        visible={!!reviewPhoto}
        onRetake={() => setReviewPhoto(null)}
        onSave={() => setReviewPhoto(null)}
        onClose={() => setReviewPhoto(null)}
      />

      <PoseInfoSheet
        pose={poseForInfo}
        visible={showPoseInfo}
        onClose={() => { setShowPoseInfo(false); setPoseForInfo(null); }}
        onStartGuide={handleStartGuide}
      />
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Web fallback
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  webFallbackText: {
    color: '#444',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.md,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  webBack: {
    position: 'absolute',
    left: SPACING.md,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
  },

  // Focus ring
  focusRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FFD54F',
    left: 0,
    top: 0,
  },

  // ── Top bar ──
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.sm,
    zIndex: 20,
  },
  topCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  topBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  timerBadge: {
    backgroundColor: '#FFD54F',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  timerText: {
    color: '#000',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: 11,
  },

  // ── Bottom section ──
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    zIndex: 20,
  },

  // Capture row
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFD54F',
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: SPACING.lg,
    marginBottom: 2,
  },

  // Category selector
  categoryRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: 4,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
    minWidth: 48,
  },
  categoryTabText: {
    color: 'rgba(255,255,255,0.35)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 0.3,
  },
  categoryTabTextActive: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.semiBold,
  },
  categoryIndicator: {
    position: 'absolute',
    bottom: 1,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFD54F',
  },

  // Pose cards
  poseRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    paddingBottom: 8,
    gap: SPACING.sm,
  },
  emptyPoses: {
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPosesText: {
    color: 'rgba(255,255,255,0.2)',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  // Permission screen
  permContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  permText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
});
