import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '../../hooks/useColors';
import { SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useCapturedPhotosStore } from '../../store/useCapturedPhotosStore';
import { useCollectionsStore } from '../../store/useCollectionsStore';
import { EmptyState } from '../../components/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const ITEM_SIZE = SCREEN_WIDTH / NUM_COLUMNS;

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { photos, removePhotos } = useCapturedPhotosStore();
  const { collections, renameCollection, deleteCollection, removePhotoFromCollection } = useCollectionsStore();

  const collection = useMemo(() => collections.find((c) => c.id === id), [collections, id]);

  const collectionPhotos = useMemo(() => {
    if (!collection) return [];
    const ids = new Set(collection.photoIds);
    return photos.filter((p) => ids.has(p.id));
  }, [photos, collection]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState(collection?.name ?? '');
  const [showMenu, setShowMenu] = useState(false);

  if (!collection) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground }]}>Collection not found.</Text>
      </View>
    );
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    Haptics.selectionAsync();
  };

  const enterMultiSelect = (id: string) => {
    setIsMultiSelect(true);
    setSelectedIds(new Set([id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const exitMultiSelect = () => {
    setIsMultiSelect(false);
    setSelectedIds(new Set());
  };

  const removeSelected = () => {
    const ids = Array.from(selectedIds);
    Alert.alert(
      'Remove from Collection',
      `Remove ${ids.length} photo${ids.length > 1 ? 's' : ''} from "${collection.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            ids.forEach((photoId) => removePhotoFromCollection(collection.id, photoId));
            exitMultiSelect();
          },
        },
      ],
    );
  };

  const deleteSelectedPhotos = () => {
    const ids = Array.from(selectedIds);
    Alert.alert(
      'Delete Photos',
      `Permanently delete ${ids.length} photo${ids.length > 1 ? 's' : ''}? This cannot be undone.`,
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
  };

  const handleRenameConfirm = () => {
    const name = renameValue.trim();
    if (name) {
      renameCollection(collection.id, name);
    }
    setShowRename(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      `Delete "${collection.name}"? Photos inside will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Collection',
          style: 'destructive',
          onPress: () => {
            deleteCollection(collection.id);
            router.back();
          },
        },
      ],
    );
  };

  const renderPhoto = ({ item }: { item: (typeof collectionPhotos)[0] }) => {
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
        {isMultiSelect && (
          <View
            style={[
              styles.selectOverlay,
              isSelected && styles.selectActive,
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
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {isMultiSelect ? (
          <>
            <TouchableOpacity onPress={exitMultiSelect} style={styles.headerBtn}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {selectedIds.size} Selected
            </Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={removeSelected}
                disabled={selectedIds.size === 0}
              >
                <Ionicons name="remove-circle-outline" size={22} color={colors.destructive} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={deleteSelectedPhotos}
                disabled={selectedIds.size === 0}
              >
                <Ionicons name="trash-outline" size={22} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={[styles.collDot, { backgroundColor: collection.color }]}>
                <Ionicons name={collection.icon as any} size={14} color="#fff" />
              </View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
                {collection.name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.headerBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Photo count */}
      <Text style={[styles.photoCount, { color: colors.mutedForeground }]}>
        {collectionPhotos.length} photo{collectionPhotos.length !== 1 ? 's' : ''}
      </Text>

      {collectionPhotos.length === 0 ? (
        <EmptyState
          icon="folder-open"
          title="Collection is Empty"
          description="Add photos to this collection from the Gallery or photo detail view."
          actionTitle="Open Gallery"
          onActionPress={() => router.navigate('/(tabs)/gallery')}
        />
      ) : (
        <FlatList
          data={collectionPhotos}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          renderItem={renderPhoto}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * Math.floor(index / NUM_COLUMNS),
            index,
          })}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          removeClippedSubviews
          maxToRenderPerBatch={12}
          windowSize={7}
          initialNumToRender={15}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Collection menu */}
      {showMenu && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={[styles.menu, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setRenameValue(collection.name);
                setShowRename(true);
              }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.foreground} />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>Rename Collection</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); handleDeleteCollection(); }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              <Text style={[styles.menuItemText, { color: colors.destructive }]}>Delete Collection</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Rename dialog */}
      {showRename && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowRename(false)}>
          <View style={styles.dialogBackdrop}>
            <View style={[styles.dialog, { backgroundColor: colors.card }]}>
              <Text style={[styles.dialogTitle, { color: colors.foreground }]}>Rename Collection</Text>
              <TextInput
                style={[styles.dialogInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="Collection name…"
                placeholderTextColor={colors.mutedForeground}
                value={renameValue}
                onChangeText={setRenameValue}
                autoFocus
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={handleRenameConfirm}
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
                  onPress={handleRenameConfirm}
                >
                  <Text style={styles.dialogConfirmText}>Save</Text>
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
  notFound: {
    textAlign: 'center',
    marginTop: 100,
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerBtn: { padding: SPACING.sm },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  headerRight: { flexDirection: 'row' },
  headerTitle: {
    fontFamily: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  collDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },

  photoCount: {
    fontFamily: TYPOGRAPHY.weights.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },

  photoCell: { padding: 0.5, overflow: 'hidden' },
  selectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  selectActive: { backgroundColor: 'rgba(255,213,79,0.3)' },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  // Menu
  menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  menu: {
    position: 'absolute',
    top: 100, right: 16,
    borderRadius: 14,
    minWidth: 220,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
  },
  menuItemText: {
    fontFamily: TYPOGRAPHY.weights.medium,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  menuDivider: { height: 1 },

  // Dialog
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xl,
  },
  dialog: { width: '100%', borderRadius: 20, padding: SPACING.xl },
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
});
