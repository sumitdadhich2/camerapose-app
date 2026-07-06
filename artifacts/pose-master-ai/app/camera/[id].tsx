import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, FlatList, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRecentStore } from '../../store/useRecentStore';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PoseOverlayLayer } from '../../features/camera/PoseOverlayLayer';
import { CameraSettingsSheet } from '../../features/camera/CameraSettingsSheet';
import { PhotoReviewModal } from '../../features/camera/PhotoReviewModal';
import { CameraGrid } from '../../features/camera/CameraGrid';
import { useCameraSettingsStore } from '../../store/useCameraSettingsStore';
import { useCapturedPhotosStore } from '../../store/useCapturedPhotosStore';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function CameraScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const { addRecentTemplate } = useRecentStore();
  const insets = useSafeAreaInsets();
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const settings = useCameraSettingsStore();
  const { photos, loadPhotos } = useCapturedPhotosStore();

  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [zoom, setZoom] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  
  // Animation values
  const captureScale = useSharedValue(1);
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusOpacity = useSharedValue(0);

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }]
  }));

  const focusAnimatedStyle = useAnimatedStyle(() => ({
    opacity: focusOpacity.value,
    transform: [
      { translateX: focusX.value - 25 },
      { translateY: focusY.value - 25 }
    ]
  }));

  useEffect(() => {
    if (id && typeof id === 'string') {
      addRecentTemplate(id);
    }
    loadPhotos();
  }, [id]);

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: '#000' }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="camera" size={64} color={colors.primary} />
        <Text style={[styles.permissionTitle, { color: colors.foreground }]}>Camera Access Required</Text>
        <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
          Pose Master AI needs camera access so you can line yourself up with pose templates.
        </Text>
        <PrimaryButton title="Grant Permission" onPress={requestPermission} />
        <TouchableOpacity style={{ marginTop: SPACING.md }} onPress={() => router.back()}>
          <Text style={{ color: colors.mutedForeground, fontFamily: TYPOGRAPHY.weights.medium }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const cycleFlash = () => {
    setFlash(current => {
      if (current === 'off') return 'auto';
      if (current === 'auto') return 'on';
      return 'off';
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    // UI Feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    captureScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1)
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: settings.quality === 'High' ? 1 : settings.quality === 'Medium' ? 0.7 : 0.4,
      });
      if (photo) {
        setReviewPhoto(photo.uri);
      }
    } catch (e) {
      console.error("Capture error:", e);
      // In web preview without real camera
      if (Platform.OS === 'web') {
        alert("Camera capture not supported in web preview");
      }
    }
  };

  const getFlashIcon = () => {
    if (flash === 'on') return 'flash';
    if (flash === 'auto') return 'flash-outline'; // In a real app we'd overlay an 'A'
    return 'flash-off-outline';
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      // Very basic zoom mapping
      const newZoom = Math.max(0, Math.min(1, zoom + (e.velocity / 1000)));
      runOnJS(setZoom)(newZoom);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      focusX.value = e.x;
      focusY.value = e.y;
      focusOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 300 })
      );
      // expo-camera tap to focus is handled internally or via coordinate APIs depending on version
      // We show UI feedback here
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const composed = Gesture.Simultaneous(pinchGesture, tapGesture);

  const lastPhoto = photos.length > 0 ? photos[0] : null;

  return (
    <GestureHandlerRootView style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.webFallback}>
          <Ionicons name="camera-outline" size={64} color="#555" />
          <Text style={{ color: '#888', marginTop: 16 }}>Camera not fully supported on Web.</Text>
          <Text style={{ color: '#888' }}>Please use Expo Go on a real device.</Text>
        </View>
      ) : (
        <GestureDetector gesture={composed}>
          <CameraView 
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
            zoom={zoom}
            animateShutter={false} // Custom animation
            mirror={settings.mirrorSelfie && facing === 'front'}
            onCameraReady={() => setIsReady(true)}
          >
            {/* Grid */}
            <CameraGrid visible={settings.grid} />
            
            {/* Pose Overlay Architecture */}
            <PoseOverlayLayer />

            {/* Tap to focus ring */}
            <Animated.View style={[styles.focusRing, focusAnimatedStyle]} />
            
            {/* Instruction Badge */}
            <View style={[styles.instructionBadge, { top: Math.max(insets.top + 80, 100) }]}>
              <Text style={styles.instructionText}>Fit body inside the gold outline</Text>
            </View>

            {/* Top Chrome */}
            <BlurView intensity={30} tint="dark" style={[styles.topControls, { paddingTop: Math.max(insets.top, 20) }]}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <Ionicons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              
              <View style={styles.centerTopControls}>
                <TouchableOpacity style={styles.iconButton} onPress={cycleFlash}>
                  <Ionicons name={getFlashIcon()} size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  {/* HDR Placeholder */}
                  <Text style={styles.hdrText}>HDR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  {/* Battery friendly placeholder */}
                  <Ionicons name="leaf-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettings(true)}>
                <Ionicons name="options-outline" size={28} color="#ffffff" />
              </TouchableOpacity>
            </BlurView>

            {/* Bottom Chrome */}
            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.modesRow}>
                <Text style={[styles.modeText, styles.modeTextActive]}>PHOTO</Text>
                <Text style={styles.modeText}>VIDEO</Text>
                <Text style={styles.modeText}>PORTRAIT</Text>
              </View>
              
              <BlurView intensity={30} tint="dark" style={styles.bottomControls}>
                {/* Gallery Preview */}
                <TouchableOpacity style={styles.galleryButton} onPress={() => router.push('/(tabs)/gallery')}>
                  {lastPhoto ? (
                    <Image source={{ uri: lastPhoto.uri }} style={styles.galleryImage} />
                  ) : (
                    <Ionicons name="images" size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>
                
                {/* Capture Button */}
                <Animated.View style={[styles.captureButtonContainer, captureAnimatedStyle]}>
                  <TouchableOpacity style={styles.captureButton} onPress={handleCapture} activeOpacity={1}>
                    <View style={styles.captureInner} />
                  </TouchableOpacity>
                </Animated.View>

                {/* Flip Camera */}
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                  <Ionicons name="camera-reverse" size={28} color="#ffffff" />
                </TouchableOpacity>
              </BlurView>
            </View>
          </CameraView>
        </GestureDetector>
      )}

      <CameraSettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} />
      
      <PhotoReviewModal 
        photoUri={reviewPhoto}
        visible={!!reviewPhoto}
        onRetake={() => setReviewPhoto(null)}
        onSave={() => {
          setReviewPhoto(null);
          // Store will update automatically, just close modal
        }}
        onClose={() => setReviewPhoto(null)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  permissionTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  permissionText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  centerTopControls: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrText: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: 12,
    opacity: 0.7,
  },
  instructionBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  instructionText: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  modeText: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: 12,
    opacity: 0.5,
    letterSpacing: 1,
  },
  modeTextActive: {
    color: '#FFD54F',
    opacity: 1,
    fontFamily: TYPOGRAPHY.weights.bold,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  captureButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFD54F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD54F',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD54F',
    left: 0,
    top: 0,
  }
});
