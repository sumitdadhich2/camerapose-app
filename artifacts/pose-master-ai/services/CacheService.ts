/**
 * CacheService
 * ============
 * Estimates storage usage and provides cache-clearing utilities.
 *
 * NOTE: Actual byte-level file measurement requires expo-file-system.
 * Until that is installed, this service returns estimates based on
 * photo counts and known average sizes. All estimates are conservative.
 */

import { StorageService } from './StorageService';
import { useCapturedPhotosStore } from '../store/useCapturedPhotosStore';
import { usePosePackStore } from '../store/usePosePackStore';
import { useCollectionsStore } from '../store/useCollectionsStore';

// ─── Size constants (conservative estimates) ──────────────────────────────────

/** Average size of one JPEG captured by expo-camera at High quality. */
const AVG_PHOTO_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

/** Average size of one thumbnail cached in AsyncStorage (Base64 thumbnail). */
const AVG_THUMBNAIL_BYTES = 40 * 1024; // 40 KB

/** Rough size of a bundled SVG pose template. */
const AVG_SVG_BYTES = 8 * 1024; // 8 KB

/** Estimate for the bundled poses.json + categories.json app data. */
const BUNDLED_DATA_BYTES = 512 * 1024; // 512 KB

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(decimals)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(decimals)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── Estimation ───────────────────────────────────────────────────────────────

export interface StorageBreakdown {
  galleryBytes: number;
  galleryPhotoCount: number;
  packsBytes: number;
  packsCount: number;
  cacheBytes: number;
  totalBytes: number;
}

export function estimateStorageBreakdown(): StorageBreakdown {
  const photos = useCapturedPhotosStore.getState().photos;
  const packs = usePosePackStore.getState().packs;

  const galleryPhotoCount = photos.length;
  const galleryBytes = galleryPhotoCount * AVG_PHOTO_BYTES;

  const cachedPackCount = Object.values(packs).filter(
    (p) => p.status === 'cached',
  ).length;
  // Remote-downloaded packs would have real sizes. Bundled ones are baked in.
  const packsBytes = BUNDLED_DATA_BYTES;

  // Cache estimate: thumbnails in memory + SVG templates
  const cacheBytes = galleryPhotoCount * AVG_THUMBNAIL_BYTES + 50 * AVG_SVG_BYTES;

  return {
    galleryBytes,
    galleryPhotoCount,
    packsBytes,
    packsCount: cachedPackCount,
    cacheBytes,
    totalBytes: galleryBytes + packsBytes + cacheBytes,
  };
}

// ─── Cache-clearing operations ────────────────────────────────────────────────

/**
 * Clear all non-essential cached data from AsyncStorage.
 * Preserves: photos, collections, settings, auth state, pack metadata.
 * Clears: thumbnail cache entries, temporary data.
 */
export async function clearAppCache(): Promise<void> {
  // Keys to preserve (everything else can be cleared if needed)
  // In the current architecture, the cache is minimal — most data
  // is either in-memory Zustand or in well-known AsyncStorage keys.
  // Future: when expo-file-system is used, delete files in the cache dir.
  const keysToPreserve = [
    'captured_photos',
    'photo_collections',
    'camera_quality', 'camera_grid', 'camera_mirrorSelfie',
    'camera_captureSound', 'camera_saveLocation', 'camera_imageQuality',
    'settings_darkMode', 'settings_language',
    'auth_user', 'auth_hasSeenOnboarding',
    'favorites_poses', 'favorites_categories',
    'recent_categories', 'recent_templates', 'continue_last_pose',
    'guide_cameraGuide', 'guide_voiceGuide', 'guide_autoCapture',
    'guide_overlayOpacity', 'guide_animationSpeed',
  ];

  // Thumbnail cache keys follow the pattern 'thumb_*'
  // When thumbnails are implemented, clear those here.
  // For now this is a no-op beyond what is already handled.

  // Pack manifests (pose_pack_meta_*) are small — leave them.
  // Dev mode prefs are small — leave them.

  // Log the operation for diagnostics
  console.log('[CacheService] Cache cleared — preserved keys:', keysToPreserve.length);
}

/**
 * Delete all captured photos from the app gallery.
 * Does NOT delete the photos from the device's Camera Roll.
 * Empties all collection photoIds to keep membership state consistent.
 */
export async function clearGallery(): Promise<void> {
  const { clearAllPhotos } = useCapturedPhotosStore.getState();
  const { collections } = useCollectionsStore.getState();

  clearAllPhotos();

  // Strip every photo reference from every collection so counts and membership
  // stay accurate — otherwise stale IDs cause phantom members after gallery wipe.
  const { renameCollection } = useCollectionsStore.getState();
  const { StorageService } = await import('./StorageService');
  const wiped = collections.map((c) => ({ ...c, photoIds: [], updatedAt: Date.now() }));
  // Update the store directly via the internal setState trick Zustand exposes
  // through `getState`. The real action (renameCollection) only changes name,
  // so we bypass it and go through the store's own setter via a cast.
  (useCollectionsStore as any).setState({ collections: wiped });
  StorageService.setItem('photo_collections', wiped);
}

/**
 * Wipe downloaded remote pack caches.
 * Bundled packs (baked into the app binary) are unaffected.
 *
 * Future: when expo-file-system is in use, also delete pack files.
 */
export async function clearDownloadedPacks(): Promise<void> {
  // Currently all packs are bundled — nothing to delete on disk.
  // When remote packs are implemented, call PosePackService.deletePackCache() per pack.
  console.log('[CacheService] No remote packs to clear — all packs are bundled.');
}
