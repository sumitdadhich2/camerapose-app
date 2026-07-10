import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { EmptyState } from '../../components/EmptyState';
import { useCapturedPhotosStore, CapturedPhoto } from '../../store/useCapturedPhotosStore';
import { useCollectionsStore } from '../../store/useCollectionsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type SortOrder = 'newest' | 'oldest' | 'favorites' | 'category';
type ViewMode = 2 | 3;

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Newest First',
  oldest: 'Oldest First',
  favorites: 'Favorites First',
  category: 'By Category',
};

export default function GalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { photos, loadPhotos, removePhotos, toggleFavorite } = useCapturedPhotosStore();
  const { collections, createCollection, loadCollections } = useCollectionsStore();

  const [viewMode, setViewMode] = useState<ViewMode>(3);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollName, setNewCollName] = useState('');

  useEffect(() => {
    // Ensure photos are always fresh regardless of how the user arrived at this screen.
    loadPhotos();
    loadCollections();
  }, []);

  // ── Filtered + sorted photos ──────────────────────────────────────────────

  const displayPhotos = useMemo(() => {
    let result = [...photos];

    if (activeCollectionId === '__favorites') {
      result = result.filter((p) => p.isFavorite);
    } else if (activeCollectionId) {
      const col = collections.find((c) => c.id === activeCollectionId);
      if (col) {
        const set = new Set(col.photoIds);
        result = result.filter((p) => set.has(p.id));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.poseName?.toLowerCase().includes(q)) ||
          (p.categoryName?.toLowerCase().includes(q)) ||
          (p.customName?.toLowerCase().includes(q)) ||
          new Date(p.timestamp).toLocaleDateString().includes(q),
      );
    }

    switch (sortOrder) {
      case 'newest':   result.sort((a, b) => b.timestamp - a.timestamp); break;
      case 'oldest':   result.sort((a, b) => a.timestamp - b.timestamp); break;
      case 'favorites':result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)); break;
      case 'category': result.sort((a, b) => (a.categoryName ?? '').localeCompare(b.categoryName ?? '')); break;
    }

    return result;
  }, [photos, activeCollectionId, collections, searchQuery, sortOrder]);

  // ── Multi-select helpers ──────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    Haptics.selectionAsync();
  }, []);

  const enterMultiSelect = useCallback((id: string) => {
    setIsMultiSelect(true);
    setSelectedIds(new Set([id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const exitMultiSelect = useCallback(() => {
    setIsMultiSelect(false);
    setSelectedIds(new Set());
  }, []);

  const deleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    Alert.alert(
      'Delete Photos',
      `Delete ${ids.length} photo${ids.length > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removePhotos(ids);
            exitMultiSelect();
          },
        },
      ],
    );
  }, [selectedIds, removePhotos, exitMultiSelect]);

  // ── Create collection ─────────────────────────────────────────────────────

  const handleCreateCollection = useCallback(() => {
    const name = newCollName.trim();
    if (!name) return;
    createCollection(name);
    setNewCollName('');
    setShowNewCollection(false);
  }, [newCollName, createCollection]);

  // ── Layout constants ──────────────────────────────────────────────────────

  const ITEM_SIZE = SCREEN_WIDTH / viewMode;

  // NOTE: getItemLayout is intentionally omitted — the dynamic ListHeaderComponent
  // (search bar, chips, sort row) makes offset computation unreliable.
  // The FlatList remains fast via removeClippedSubviews, windowSize, and maxToRenderPerBatch.

  // ── Render photo cell ─────────────────────────────────────────────────────

  const renderPhoto = useCallback(
    ({ item, index }: { item: CapturedPhoto; index: number }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <TouchableOpacity
          style={[styles.photoCell, { width: ITEM_SIZE, height: ITEM_SIZE }]}
          activeOpacity={isMultiSelect ? 0.6 : 0.9}
          onPress={() => {
            if (isMultiSelect) {
              toggleSelect(item.id);
            } else {
              router.push(`/photo/${item.id}`);
            }
          }}
          onLongPress={() => enterMultiSelect(item.id)}
        >
          <Image
            source={{ uri: item.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />

          {/* Favorite indicator */}
          {item.isFavorite && !isMultiSelect && (
            <View style={styles.favDot}>
              <Ionicons name="heart" size={10} color="#E57373" />
            </View>
          )}

          {/* Multi-select overlay */}
          {isMultiSelect && (
            <View
              style={[
                styles.selectOverlay,
                isSelected && styles.selectOverlayActive,
              ]}
            >
              {isSelected && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#000" />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [ITEM_SIZE, isMultiSelect, selectedIds, toggleSelect, enterMultiSelect, colors.primary],
  );

  // ── Empty state ───────────────────────────────────────────────────────────

  if (photos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="images"
          title="No Photos Yet"
          description="Photos you capture with Pose Master will appear here."
          actionTitle="Browse Templates"
          onActionPress={() => router.navigate('/(tabs)/categories')}
        />
      </View>
    );
  }

  // ── Collection chips ──────────────────────────────────────────────────────

  const favCount = photos.filter((p) => p.isFavorite).length;

  const CollectionChips = (
    <FlatList
      horizontal
      data={[
        { id: null, name: 'All', icon: 'grid', count: photos.length },
        { id: '__favorites', name: 'Favorites', icon: 'heart', count: favCount },
        ...collections.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          count: c.photoIds.length,
        })),
        { id: '__new', name: 'New', icon: 'add', count: 0 },
      ]}
      keyExtractor={(item) => item.id ?? '__all'}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      renderItem={({ item }) => {
        if (item.id === '__new') {
          return (
            <TouchableOpacity
              style={[styles.chip, { borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1 }]}
              onPress={() => setShowNewCollection(true)}
            >
              <Ionicons name="add" size={14} color={colors.mutedForeground} />
              <Text style={[styles.chipText, { color: colors.mutedForeground }]}>New</Text>
            </TouchableOpacity>
          );
        }
        const active = activeCollectionId === item.id;
        return (
          <TouchableOpacity
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveCollectionId(active ? null : item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={13}
              color={active ? '#000' : colors.mutedForeground}
            />
            <Text
              style={[
                styles.chipText,
                { color: active ? '#000' : colors.foreground },
                active && { fontFamily: TYPOGRAPHY.weights.bold },
              ]}
            >
              {item.name}
              {item.count > 0 ? ` ${item.count}` : ''}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  const ListHeader = (
    <View>
      {/* Search bar */}
      {showSearch && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <Ionicons name="search" size={16} color={colors.mutedForeground} style={{ marginLeft: 12 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search poses, categories, dates…"
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      {/* Collection chips */}
      {CollectionChips}

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortSheet(true)}
        >
          <Ionicons name="swap-vertical" size={14} color={colors.mutedForeground} />
          <Text style={[styles.sortText, { color: colors.mutedForeground }]}>
            {SORT_LABELS[sortOrder]}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.photoCount, { color: colors.mutedForeground }]}>
          {displayPhotos.length} photo{displayPhotos.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      {isMultiSelect ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          style={[
            styles.header,
            { paddingTop: Math.max(insets.top, 20), backgroundColor: colors.background },
          ]}
        >
          <TouchableOpacity onPress={exitMultiSelect} style={styles.headerBtn}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {selectedIds.size} Selected
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={deleteSelected}
              disabled={selectedIds.size === 0}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={selectedIds.size > 0 ? colors.destructive : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <View
          style={[
            styles.header,
            { paddingTop: Math.max(insets.top, 20), backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Gallery</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                setShowSearch((v) => !v);
                if (showSearch) setSearchQuery('');
              }}
            >
              <Ionicons
                name={showSearch ? 'search' : 'search-outline'}
                size={22}
                color={showSearch ? colors.primary : colors.foreground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                setViewMode((m) => (m === 3 ? 2 : 3));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons
                name={viewMode === 3 ? 'grid' : 'grid-outline'}
                size={22}
                color={colors.foreground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/storage')}
            >
              <Ionicons name="layers-outline" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Photo grid ── */}
      <FlatList
        key={viewMode}
        data={displayPhotos}
        keyExtractor={(item) => item.id}
        numColumns={viewMode}
        renderItem={renderPhoto}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        removeClippedSubviews
        maxToRenderPerBatch={viewMode * 4}
        windowSize={7}
        initialNumToRender={viewMode * 5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Ionicons name="images-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.noResultsText, { color: colors.mutedForeground }]}>
              No photos match
            </Text>
          </View>
        }
      />

      {/* ── Sort sheet ── */}
      {showSortSheet && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowSortSheet(false)}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortSheet(false)}
          />
          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            exiting={SlideOutDown.duration(200)}
            style={[styles.sortSheet, { backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card }]}
          >
            {Platform.OS === 'ios' && (
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            )}
            <View style={[styles.sheetHandle, { backgroundColor: colors.muted }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Sort Photos</Text>
            {(Object.keys(SORT_LABELS) as SortOrder[]).map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.sortOption}
                onPress={() => { setSortOrder(key); setShowSortSheet(false); }}
              >
                <Text style={[
                  styles.sortOptionText,
                  { color: sortOrder === key ? colors.primary : colors.foreground },
                  sortOrder === key && { fontFamily: TYPOGRAPHY.weights.bold },
                ]}>
                  {SORT_LABELS[key]}
                </Text>
                {sortOrder === key && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Modal>
      )}

      {/* ── New collection dialog ── */}
      {showNewCollection && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowNewCollection(false)}>
          <View style={styles.dialogBackdrop}>
            <View style={[styles.dialog, { backgroundColor: colors.card }]}>
              <Text style={[styles.dialogTitle, { color: colors.foreground }]}>
                New Collection
              </Text>
              <TextInput
                style={[styles.dialogInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="Collection name…"
                placeholderTextColor={colors.mutedForeground}
                value={newCollName}
                onChangeText={setNewCollName}
                autoFocus
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={handleCreateCollection}
              />
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={styles.dialogCancel}
                  onPress={() => { setShowNewCollection(false); setNewCollName(''); }}
                >
                  <Text style={[styles.dialogCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogConfirm, { backgroundColor: colors.primary }]}
                  onPress={handleCreateCollection}
                >
                  <Text style={styles.dialogConfirmText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xxl,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: SPACING.sm,
    marginLeft: 4,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    paddingHorizontal: SPACING.sm,
    height: '100%',
  },

  // Collection chips
  chipRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },

  // Sort bar
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  photoCount: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.xs,
  },

  // Grid
  list: { flexGrow: 1 },
  photoCell: {
    padding: 0.5,
    overflow: 'hidden',
  },
  favDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectOverlayActive: {
    backgroundColor: 'rgba(255,213,79,0.3)',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // No results
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: SPACING.md,
  },
  noResultsText: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
  },

  // Sort sheet
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sortSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
  },
  sortOptionText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },

  // New collection dialog
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  dialogActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dialogCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
  },
  dialogCancelText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  dialogConfirm: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
  },
  dialogConfirmText: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#000',
  },
});
