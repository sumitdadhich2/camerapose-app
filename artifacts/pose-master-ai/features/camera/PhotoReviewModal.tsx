import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import * as MediaLibrary from 'expo-media-library';
import { useCapturedPhotosStore } from '../../store/useCapturedPhotosStore';
import * as Haptics from 'expo-haptics';

interface PhotoReviewModalProps {
  photoUri: string | null;
  visible: boolean;
  onRetake: () => void;
  onSave: () => void;
  onClose: () => void;
  // Pose context forwarded from camera screen
  poseId?: string;
  poseName?: string;
  categoryId?: string;
  categoryName?: string;
  facingCamera?: 'front' | 'back';
}

export const PhotoReviewModal: React.FC<PhotoReviewModalProps> = ({
  photoUri,
  visible,
  onRetake,
  onSave,
  onClose,
  poseId,
  poseName,
  categoryId,
  categoryName,
  facingCamera,
}) => {
  const colors = useColors();
  const { addPhoto } = useCapturedPhotosStore();
  const [saving, setSaving] = React.useState(false);

  if (!visible || !photoUri) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(photoUri);
        addPhoto({
          id: asset.id,
          uri: asset.uri,
          timestamp: Date.now(),
          poseId,
          poseName,
          categoryId,
          categoryName,
          facingCamera,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave();
      } else {
        alert('Permission needed to save photos');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving photo');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        url: photoUri,
        message: poseName ? `Check out my pose: ${poseName}` : 'Check out this pose!',
        title: poseName ?? 'Pose Master AI',
      });
    } catch {
      // User dismissed
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <Image
          source={{ uri: photoUri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          transition={200}
        />

        {/* Pose label */}
        {poseName && (
          <View style={styles.poseLabel}>
            <Text style={styles.poseLabelText} numberOfLines={1}>{poseName}</Text>
            {categoryName && (
              <Text style={styles.categoryLabelText}>{categoryName}</Text>
            )}
          </View>
        )}

        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={onRetake}
          >
            <Ionicons name="trash-outline" size={24} color={colors.destructive} />
            <Text style={[styles.actionText, { color: colors.destructive }]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="checkmark" size={24} color={colors.primaryForeground} />
            <Text style={[styles.saveText, { color: colors.primaryForeground }]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  poseLabel: {
    position: 'absolute',
    top: 100,
    left: SPACING.md,
    right: SPACING.md,
    alignItems: 'center',
    zIndex: 10,
  },
  poseLabelText: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  categoryLabelText: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: SPACING.md,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  actionText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  saveText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
});
