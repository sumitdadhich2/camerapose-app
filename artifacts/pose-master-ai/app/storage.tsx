import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColors } from '../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../constants/theme';
import {
  clearAppCache,
  clearDownloadedPacks,
  clearGallery,
  estimateStorageBreakdown,
  formatBytes,
  StorageBreakdown,
} from '../services/CacheService';
import { usePosePackStore } from '../store/usePosePackStore';
import { useCapturedPhotosStore } from '../store/useCapturedPhotosStore';

export default function StorageScreen() {
  const colors = useColors();
  const { packs } = usePosePackStore();
  const { photos } = useCapturedPhotosStore();

  const [breakdown, setBreakdown] = useState<StorageBreakdown | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    setBreakdown(estimateStorageBreakdown());
  }, [photos, packs]);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary cached data. Your photos and collections will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            setClearingCache(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await clearAppCache();
            setBreakdown(estimateStorageBreakdown());
            setClearingCache(false);
            Alert.alert('Done', 'Cache cleared successfully.');
          },
        },
      ],
    );
  };

  const handleDeleteGallery = () => {
    Alert.alert(
      'Delete Gallery',
      `This will permanently delete all ${photos.length} photo${photos.length !== 1 ? 's' : ''} from the app. Your device Camera Roll is not affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await clearGallery();
            setBreakdown(estimateStorageBreakdown());
          },
        },
      ],
    );
  };

  const handleDeleteDownloads = () => {
    Alert.alert(
      'Delete Downloads',
      'Currently all pose packs are bundled with the app. There are no separate downloads to remove.',
      [{ text: 'OK' }],
    );
  };

  const packEntries = Object.entries(packs);
  const cachedPacks = packEntries.filter(([, v]) => v.status === 'cached');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Storage Overview ── */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>STORAGE OVERVIEW</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: (colors as any).radius ?? 16 }]}>
        <StorageRow
          colors={colors}
          icon="images"
          iconColor="#64B5F6"
          title="Gallery Photos"
          detail={breakdown ? `${breakdown.galleryPhotoCount} photo${breakdown.galleryPhotoCount !== 1 ? 's' : ''}` : '—'}
          size={breakdown ? formatBytes(breakdown.galleryBytes) : '—'}
          note="Estimated · does not include device Camera Roll"
          action="Delete Gallery"
          actionColor={colors.destructive}
          onAction={handleDeleteGallery}
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <StorageRow
          colors={colors}
          icon="archive"
          iconColor="#FFCC80"
          title="Downloaded Packs"
          detail={`${cachedPacks.length} pack${cachedPacks.length !== 1 ? 's' : ''}`}
          size={breakdown ? formatBytes(breakdown.packsBytes) : '—'}
          note="Bundled with app — no separate download"
          action="Manage Packs"
          actionColor={colors.primary}
          onAction={() => {}} // scrolls below
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <StorageRow
          colors={colors}
          icon="layers"
          iconColor="#CE93D8"
          title="App Cache"
          detail="Thumbnails & templates"
          size={breakdown ? formatBytes(breakdown.cacheBytes) : '—'}
          note="Estimated · automatically managed"
          action={clearingCache ? 'Clearing…' : 'Clear Cache'}
          actionColor={colors.primary}
          onAction={handleClearCache}
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.storageRow}>
          <View style={[styles.storageIconWrap, { backgroundColor: '#A5D6A730' }]}>
            <Ionicons name="phone-portrait-outline" size={20} color="#A5D6A7" />
          </View>
          <View style={styles.storageInfo}>
            <Text style={[styles.storageTitle, { color: colors.foreground }]}>Free Device Storage</Text>
            <Text style={[styles.storageNote, { color: colors.mutedForeground }]}>
              Requires expo-file-system — not yet installed
            </Text>
          </View>
          <Text style={[styles.storageSize, { color: colors.mutedForeground }]}>N/A</Text>
        </View>
      </View>

      {/* ── Total ── */}
      {breakdown && (
        <View style={[styles.totalRow, { backgroundColor: colors.card, borderRadius: (colors as any).radius ?? 16 }]}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total App Usage</Text>
          <Text style={[styles.totalSize, { color: colors.primary }]}>
            ~{formatBytes(breakdown.totalBytes)}
          </Text>
        </View>
      )}

      {/* ── Pose Pack Manager ── */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>POSE PACK MANAGER</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: (colors as any).radius ?? 16 }]}>
        {packEntries.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No packs loaded yet.
          </Text>
        ) : (
          packEntries.map(([packId, state], i) => (
            <View key={packId}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <View style={styles.packRow}>
                <View style={[styles.packIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="archive-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.packInfo}>
                  <Text style={[styles.packName, { color: colors.foreground }]}>
                    Pack {packId.replace('c', '')}
                  </Text>
                  <Text style={[styles.packMeta, { color: colors.mutedForeground }]}>
                    Version {state.version ?? '1.0.0'}
                    {state.cachedAt
                      ? `  ·  Updated ${new Date(state.cachedAt).toLocaleDateString()}`
                      : ''}
                  </Text>
                </View>
                <View style={styles.packStatus}>
                  {state.status === 'cached' ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#A5D6A720' }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#A5D6A7" />
                      <Text style={[styles.statusText, { color: '#A5D6A7' }]}>Cached</Text>
                    </View>
                  ) : state.status === 'downloading' ? (
                    <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="cloud-download-outline" size={14} color={colors.primary} />
                      <Text style={[styles.statusText, { color: colors.primary }]}>
                        {Math.round((state.progress ?? 0) * 100)}%
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: colors.destructive + '20' }]}>
                      <Ionicons name="alert-circle-outline" size={14} color={colors.destructive} />
                      <Text style={[styles.statusText, { color: colors.destructive }]}>
                        {state.status === 'failed' ? 'Failed' : 'Not Loaded'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ── Danger Zone ── */}
      <Text style={[styles.sectionLabel, { color: colors.destructive }]}>DANGER ZONE</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: (colors as any).radius ?? 16 }]}>
        <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteGallery}>
          <View style={[styles.dangerIcon, { backgroundColor: colors.destructive + '15' }]}>
            <Ionicons name="images-outline" size={18} color={colors.destructive} />
          </View>
          <View style={styles.dangerInfo}>
            <Text style={[styles.dangerTitle, { color: colors.destructive }]}>Delete Gallery</Text>
            <Text style={[styles.dangerNote, { color: colors.mutedForeground }]}>
              Removes all {photos.length} photos from the app
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.destructive} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.dangerRow} onPress={handleClearCache}>
          <View style={[styles.dangerIcon, { backgroundColor: colors.destructive + '15' }]}>
            <Ionicons name="trash-outline" size={18} color={colors.destructive} />
          </View>
          <View style={styles.dangerInfo}>
            <Text style={[styles.dangerTitle, { color: colors.destructive }]}>Clear All Cache</Text>
            <Text style={[styles.dangerNote, { color: colors.mutedForeground }]}>
              Clears temporary cached data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Privacy note */}
      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.mutedForeground} />
        <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
          All photos stay on your device. Nothing is ever uploaded automatically.
        </Text>
      </View>
    </ScrollView>
  );
}

const StorageRow = ({
  colors, icon, iconColor, title, detail, size, note, action, actionColor, onAction,
}: any) => (
  <View style={styles.storageRow}>
    <View style={[styles.storageIconWrap, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.storageInfo}>
      <Text style={[styles.storageTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.storageDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      {note && <Text style={[styles.storageNote, { color: colors.mutedForeground }]}>{note}</Text>}
    </View>
    <View style={styles.storageSizeCol}>
      <Text style={[styles.storageSize, { color: colors.foreground }]}>{size}</Text>
      <TouchableOpacity onPress={onAction}>
        <Text style={[styles.storageAction, { color: actionColor }]}>{action}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: SPACING.lg,
    paddingBottom: 60,
  },

  sectionLabel: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xs,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    paddingHorizontal: 4,
  },

  card: {
    overflow: 'hidden',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },

  divider: { height: 1, marginVertical: SPACING.sm },

  // Storage rows
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  storageIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  storageInfo: { flex: 1 },
  storageTitle: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 2,
  },
  storageDetail: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  storageNote: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  storageSizeCol: { alignItems: 'flex-end', gap: 4 },
  storageSize: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  storageAction: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  totalSize: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
  },

  // Pack Manager
  packRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  packIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  packInfo: { flex: 1 },
  packName: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 2,
  },
  packMeta: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  packStatus: { alignItems: 'flex-end' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  statusText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },

  // Danger
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dangerIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  dangerInfo: { flex: 1 },
  dangerTitle: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    marginBottom: 2,
  },
  dangerNote: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
  },

  emptyText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },

  // Privacy
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  privacyText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 18,
  },
});
