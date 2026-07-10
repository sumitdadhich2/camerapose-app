import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useCapturedPhotosStore } from '../../store/useCapturedPhotosStore';
import { useCollectionsStore } from '../../store/useCollectionsStore';

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { photos, toggleFavorite, removePhoto, updatePhoto } = useCapturedPhotosStore();
  const { collections, addPhotoToCollection, removePhotoFromCollection } = useCollectionsStore();

  const photo = useMemo(() => photos.find((p) => p.id === id), [photos, id]);
  const photoIndex = useMemo(() => photos.findIndex((p) => p.id === id), [photos, id]);

  const [showInfo, setShowInfo] = useState(true);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(photo?.customName ?? '');
  const [showCollections, setShowCollections] = useState(false);

  if (!photo) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 8 }]} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.notFound}>Photo not found</Text>
      </View>
    );
  }

  const displayName = photo.customName ?? photo.poseName ?? 'Captured Photo';
  const capturedDate = new Date(photo.timestamp);
  const dateStr = capturedDate.toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = capturedDate.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit',
  });

  const prevPhoto = photoIndex > 0 ? photos[photoIndex - 1] : null;
  const nextPhoto = photoIndex < photos.length - 1 ? photos[photoIndex + 1] : null;

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleShare = async () => {
    try {
      await Share.share({
        url: photo.uri,
        message: `Check out this pose: ${displayName}`,
        title: displayName,
      });
    } catch {
      // User dismissed
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Photo', 'Delete this photo? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removePhoto(photo.id);
          router.back();
        },
      },
    ]);
  };

  const handleRename = () => {
    setRenameValue(photo.customName ?? photo.poseName ?? '');
    setShowRename(true);
  };

  const confirmRename = () => {
    const name = renameValue.trim();
    updatePhoto(photo.id, { customName: name || undefined });
    setShowRename(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(photo.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Full-screen photo */}
      <Image
        source={{ uri: photo.uri }}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        transition={200}
      />

      {/* Top controls */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.photoIndexLabel}>
          {photoIndex + 1} / {photos.length}
        </Text>

        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => setShowInfo((v) => !v)}
        >
          <Ionicons
            name={showInfo ? 'information-circle' : 'information-circle-outline'}
            size={22}
            color={showInfo ? '#FFD54F' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Prev / Next navigation */}
      {prevPhoto && (
        <TouchableOpacity
          style={[styles.navBtn, styles.navLeft]}
          onPress={() => router.replace(`/photo/${prevPhoto.id}`)}
        >
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}
      {nextPhoto && (
        <TouchableOpacity
          style={[styles.navBtn, styles.navRight]}
          onPress={() => router.replace(`/photo/${nextPhoto.id}`)}
        >
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}

      {/* Info + action panel */}
      {showInfo && (
        <Animated.View
          entering={SlideInDown.springify().damping(22)}
          style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}
        >
          {Platform.OS === 'ios' && (
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
          )}
          {Platform.OS !== 'ios' && (
            <View style={[StyleSheet.absoluteFill, styles.panelDark]} />
          )}

          {/* Metadata */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{dateStr}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{timeStr}</Text>
            </View>
          </View>

          <Text style={styles.photoTitle} numberOfLines={1}>{displayName}</Text>

          <View style={styles.metaRow}>
            {photo.categoryName && (
              <View style={styles.metaBadge}>
                <Ionicons name="folder-outline" size={12} color="#FFD54F" />
                <Text style={styles.metaBadgeText}>{photo.categoryName}</Text>
              </View>
            )}
            {photo.facingCamera && (
              <View style={styles.metaBadge}>
                <Ionicons
                  name={photo.facingCamera === 'front' ? 'camera-reverse-outline' : 'camera-outline'}
                  size={12}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={[styles.metaBadgeText, { color: 'rgba(255,255,255,0.5)' }]}>
                  {photo.facingCamera === 'front' ? 'Front Camera' : 'Rear Camera'}
                </Text>
              </View>
            )}
          </View>

          {/* Action row */}
          <View style={styles.actions}>
            <ActionButton
              icon={photo.isFavorite ? 'heart' : 'heart-outline'}
              label={photo.isFavorite ? 'Unfavorite' : 'Favorite'}
              color={photo.isFavorite ? '#E57373' : '#fff'}
              onPress={handleToggleFavorite}
            />
            <ActionButton icon="share-outline" label="Share" color="#fff" onPress={handleShare} />
            <ActionButton icon="pencil-outline" label="Rename" color="#fff" onPress={handleRename} />
            <ActionButton
              icon="folder-open-outline"
              label="Collection"
              color="#fff"
              onPress={() => setShowCollections(true)}
            />
            <ActionButton
              icon="trash-outline"
              label="Delete"
              color="#E57373"
              onPress={handleDelete}
            />
          </View>
        </Animated.View>
      )}

      {/* ── Rename dialog ── */}
      {showRename && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowRename(false)}>
          <View style={styles.dialogBackdrop}>
            <View style={[styles.dialog, { backgroundColor: colors.card }]}>
              <Text style={[styles.dialogTitle, { color: colors.foreground }]}>Rename Photo</Text>
              <TextInput
                style={[styles.dialogInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="Enter a name…"
                placeholderTextColor={colors.mutedForeground}
                value={renameValue}
                onChangeText={setRenameValue}
                autoFocus
                maxLength={60}
                returnKeyType="done"
                onSubmitEditing={confirmRename}
              />
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={styles.dialogCancel}
                  onPress={() => setShowRename(false)}
                >
                  <Text style={[styles.dialogCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogConfirm, { backgroundColor: colors.primary }]}
                  onPress={confirmRename}
                >
                  <Text style={styles.dialogConfirmText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Collections picker ── */}
      {showCollections && (
        <Modal transparent animationType="slide" onRequestClose={() => setShowCollections(false)}>
          <TouchableOpacity
            style={styles.dialogBackdrop}
            activeOpacity={1}
            onPress={() => setShowCollections(false)}
          />
          <View style={[styles.collSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.muted }]} />
            <Text style={[styles.collSheetTitle, { color: colors.foreground }]}>Add to Collection</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {collections.map((col) => {
                const inCollection = col.photoIds.includes(photo.id);
                return (
                  <TouchableOpacity
                    key={col.id}
                    style={styles.collOption}
                    onPress={() => {
                      inCollection
                        ? removePhotoFromCollection(col.id, photo.id)
                        : addPhotoToCollection(col.id, photo.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={[styles.collDot, { backgroundColor: col.color }]}>
                      <Ionicons name={col.icon as any} size={14} color="#fff" />
                    </View>
                    <Text style={[styles.collOptionText, { color: colors.foreground }]}>{col.name}</Text>
                    {inCollection && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const ActionButton: React.FC<{
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}> = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon as any} size={24} color={color} />
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  notFound: { color: '#fff', textAlign: 'center', marginTop: 100 },

  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    zIndex: 10,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoIndexLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  // Navigation
  navBtn: {
    position: 'absolute',
    top: '45%',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 5,
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },

  // Info panel
  panel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  panelDark: { backgroundColor: 'rgba(0,0,0,0.75)' },

  photoTitle: {
    color: '#fff',
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metaBadgeText: {
    color: '#FFD54F',
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  actionBtn: { alignItems: 'center', gap: 4, minWidth: 52 },
  actionLabel: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: 10,
  },

  // Dialogs
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  dialog: {
    width: '100%',
    borderRadius: 20,
    padding: SPACING.xl,
  },
  dialogTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.lg,
  },
  dialogInput: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    marginBottom: SPACING.lg,
  },
  dialogActions: { flexDirection: 'row', gap: SPACING.sm },
  dialogCancel: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderRadius: 12 },
  dialogCancelText: { fontFamily: TYPOGRAPHY.weights.medium, fontSize: TYPOGRAPHY.sizes.md },
  dialogConfirm: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderRadius: 12 },
  dialogConfirmText: { fontFamily: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md, color: '#000' },

  // Collections sheet
  collSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingHorizontal: SPACING.lg,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  collSheetTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    paddingBottom: SPACING.md,
  },
  collOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  collDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  collOptionText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },

  closeBtn: {
    position: 'absolute',
    left: SPACING.md,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
});
