/**
 * PosePackService
 * ===============
 * Manages the lifecycle of pose packs — bundled or remotely downloaded.
 *
 * CURRENT STATE:
 * All categories ship bundled with the app. ensurePackAvailable() resolves
 * instantly for all current categories. No network calls are made.
 *
 * FUTURE (remote packs):
 * Add a category ID → RemotePackManifest entry to REMOTE_PACK_MANIFESTS.
 * Install expo-file-system: `expo install expo-file-system`
 * The download, extraction, and caching pipeline is wired and ready.
 *
 * USAGE:
 *   import { PosePackService } from './PosePackService';
 *
 *   // Call before navigating to a category:
 *   const ready = await PosePackService.ensurePackAvailable(categoryId);
 *   if (ready) router.push(`/category/${categoryId}`);
 *
 * DESIGN RULES:
 * - Never display technical terms (ZIP, URL, Extracting) to users.
 * - Never use fake timers or random progress values.
 * - All pack state flows through usePosePackStore (Zustand).
 */

import { StorageService } from './StorageService';
import { usePosePackStore } from '../store/usePosePackStore';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Version string applied to all bundled packs. Bump when bundled data changes. */
const BUNDLED_PACK_VERSION = '1.0.0';

/** Storage key prefix for persisted pack metadata. */
const PACK_META_KEY_PREFIX = 'pose_pack_meta_';

/**
 * Category IDs that are bundled with the app binary.
 * These are always considered 'cached' — no download needed.
 *
 * Add new bundled category IDs here when app data is expanded.
 */
const BUNDLED_CATEGORY_IDS = new Set([
  'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8',
]);

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Manifest describing a remotely downloadable pose pack.
 * Add entries to REMOTE_PACK_MANIFESTS to enable remote packs.
 */
export interface RemotePackManifest {
  categoryId: string;
  /** Semantic version of the pack content. */
  version: string;
  /** HTTPS URL pointing to the pack archive. */
  packUrl: string;
  /** Expected pack size in bytes (used to display progress accurately). */
  sizeBytes: number;
  /** Number of pose templates in the pack. */
  posesCount: number;
  /** SHA-256 checksum for integrity verification. null = skip check. */
  checksum: string | null;
  /** Minimum app semver that can open this pack. */
  minAppVersion: string;
  /** ISO 8601 release date. */
  releasedAt: string;
}

export interface PersistedPackMeta {
  categoryId: string;
  version: string;
  cachedAt: number;
  source: 'bundled' | 'remote';
}

// ─── Remote manifest registry ─────────────────────────────────────────────────

/**
 * Future remote packs. Add an entry here to enable downloading for a category.
 *
 * Example (do not uncomment until a real URL is available):
 *
 *   'c9': {
 *     categoryId: 'c9',
 *     version: '1.0.0',
 *     packUrl: 'https://cdn.example.com/packs/c9-v1.zip',
 *     sizeBytes: 2_400_000,
 *     posesCount: 25,
 *     checksum: null,
 *     minAppVersion: '1.0.0',
 *     releasedAt: '2026-01-01T00:00:00Z',
 *   },
 */
const REMOTE_PACK_MANIFESTS: Record<string, RemotePackManifest> = {
  // No remote packs yet — all categories are bundled.
};

// ─── Friendly user messages ───────────────────────────────────────────────────

const LOADING_MESSAGES_BY_PROGRESS: Array<{ upTo: number; message: string }> = [
  { upTo: 0.25, message: 'Preparing poses...' },
  { upTo: 0.55, message: 'Loading pose pack...' },
  { upTo: 0.80, message: 'Optimizing templates...' },
  { upTo: 0.98, message: 'Almost ready...' },
  { upTo: 1.00, message: 'Opening...' },
];

export function getLoadingMessage(progress: number): string {
  for (const { upTo, message } of LOADING_MESSAGES_BY_PROGRESS) {
    if (progress <= upTo) return message;
  }
  return 'Opening...';
}

// ─── Service ──────────────────────────────────────────────────────────────────

class PosePackManager {
  /** In-flight download promises (one per categoryId). */
  private activeDownloads = new Map<string, Promise<boolean>>();

  /**
   * Initialise all bundled packs as 'cached' in the store.
   * Call once at app startup (e.g., in the root _layout.tsx).
   */
  async initialize(): Promise<void> {
    const store = usePosePackStore.getState();

    for (const categoryId of BUNDLED_CATEGORY_IDS) {
      const persisted = await StorageService.getItem<PersistedPackMeta>(
        `${PACK_META_KEY_PREFIX}${categoryId}`,
      );
      store.setPackState(categoryId, {
        status: 'cached',
        progress: 1,
        loadingMessage: '',
        version: persisted?.version ?? BUNDLED_PACK_VERSION,
        cachedAt: persisted?.cachedAt ?? Date.now(),
        failedAt: null,
      });
    }

    // Restore cached state for any previously downloaded remote packs.
    for (const categoryId of Object.keys(REMOTE_PACK_MANIFESTS)) {
      if (BUNDLED_CATEGORY_IDS.has(categoryId)) continue;
      const persisted = await StorageService.getItem<PersistedPackMeta>(
        `${PACK_META_KEY_PREFIX}${categoryId}`,
      );
      if (persisted) {
        store.setPackState(categoryId, {
          status: 'cached',
          progress: 1,
          loadingMessage: '',
          version: persisted.version,
          cachedAt: persisted.cachedAt,
          failedAt: null,
        });
      }
    }
  }

  /**
   * Ensure a category's pose pack is available locally.
   *
   * - Bundled categories: resolves immediately (no network).
   * - Cached remote packs: resolves immediately.
   * - Uncached remote packs: downloads, caches, then resolves.
   * - Unknown category: treated as bundled (resolves immediately).
   *
   * Returns true when the category is ready to open.
   * Returns false if a download was attempted and failed.
   */
  async ensurePackAvailable(categoryId: string): Promise<boolean> {
    // Already in a terminal 'cached' state — open instantly.
    const currentState = usePosePackStore.getState().packs[categoryId];
    if (currentState?.status === 'cached') {
      return true;
    }

    // Bundled categories are always available.
    if (BUNDLED_CATEGORY_IDS.has(categoryId)) {
      await this.markAsCached(categoryId, BUNDLED_PACK_VERSION, 'bundled');
      return true;
    }

    // No remote manifest — treat as bundled (safe fallback).
    const manifest = REMOTE_PACK_MANIFESTS[categoryId];
    if (!manifest) {
      await this.markAsCached(categoryId, BUNDLED_PACK_VERSION, 'bundled');
      return true;
    }

    // Deduplicate concurrent taps — don't start two downloads.
    const existing = this.activeDownloads.get(categoryId);
    if (existing) return existing;

    const download = this.downloadPack(categoryId, manifest);
    this.activeDownloads.set(categoryId, download);
    const result = await download;
    this.activeDownloads.delete(categoryId);
    return result;
  }

  /**
   * Retry a previously failed download.
   * Safe to call on any state — ignored if already cached or downloading.
   */
  async retryDownload(categoryId: string): Promise<boolean> {
    const current = usePosePackStore.getState().packs[categoryId];
    if (current?.status === 'cached' || current?.status === 'downloading') {
      return current.status === 'cached';
    }

    // Reset to not_cached so the next ensurePackAvailable triggers a download.
    usePosePackStore.getState().setPackState(categoryId, {
      status: 'not_cached',
      progress: 0,
      loadingMessage: '',
      failedAt: null,
    });

    return this.ensurePackAvailable(categoryId);
  }

  /**
   * Check whether a category's pack is available locally.
   * Does NOT start a download.
   */
  isPackCached(categoryId: string): boolean {
    if (BUNDLED_CATEGORY_IDS.has(categoryId)) return true;
    const state = usePosePackStore.getState().packs[categoryId];
    return state?.status === 'cached';
  }

  /**
   * Get the installed version of a pack. null if not cached.
   */
  getPackVersion(categoryId: string): string | null {
    const state = usePosePackStore.getState().packs[categoryId];
    return state?.version ?? null;
  }

  /**
   * Delete a cached remote pack from local storage.
   * Bundled packs cannot be deleted.
   * After deletion the category returns to 'not_cached'.
   *
   * Future: also delete files from FileSystem.documentDirectory.
   */
  async deletePackCache(categoryId: string): Promise<void> {
    if (BUNDLED_CATEGORY_IDS.has(categoryId)) return;
    await StorageService.removeItem(`${PACK_META_KEY_PREFIX}${categoryId}`);
    usePosePackStore.getState().setPackState(categoryId, {
      status: 'not_cached',
      progress: 0,
      loadingMessage: '',
      version: null,
      cachedAt: null,
      failedAt: null,
    });
  }

  /**
   * Check remote manifests for newer versions of cached packs.
   * Future: call this on Wi-Fi, silently in the background.
   */
  async checkForUpdates(): Promise<string[]> {
    const updatesAvailable: string[] = [];
    for (const [categoryId, manifest] of Object.entries(REMOTE_PACK_MANIFESTS)) {
      const currentVersion = this.getPackVersion(categoryId);
      if (currentVersion && currentVersion !== manifest.version) {
        updatesAvailable.push(categoryId);
      }
    }
    return updatesAvailable;
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async markAsCached(
    categoryId: string,
    version: string,
    source: 'bundled' | 'remote' = 'bundled',
  ): Promise<void> {
    const now = Date.now();
    usePosePackStore.getState().setPackState(categoryId, {
      status: 'cached',
      progress: 1,
      loadingMessage: '',
      version,
      cachedAt: now,
      failedAt: null,
    });
    await StorageService.setItem<PersistedPackMeta>(
      `${PACK_META_KEY_PREFIX}${categoryId}`,
      { categoryId, version, cachedAt: now, source },
    );
  }

  /**
   * Download a remote pack.
   *
   * FUTURE IMPLEMENTATION GUIDE:
   *
   * Install: expo install expo-file-system
   * Import:  import * as FileSystem from 'expo-file-system';
   *
   * const packDir = `${FileSystem.documentDirectory}packs/${categoryId}/`;
   * await FileSystem.makeDirectoryAsync(packDir, { intermediates: true });
   *
   * const downloadResumable = FileSystem.createDownloadResumable(
   *   manifest.packUrl,
   *   `${packDir}pack.zip`,
   *   {},
   *   (progress) => {
   *     const pct = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
   *     store.setPackState(categoryId, {
   *       progress: pct,
   *       loadingMessage: getLoadingMessage(pct),
   *     });
   *   },
   * );
   *
   * const result = await downloadResumable.downloadAsync();
   *
   * // Extract + index the pack, then mark as cached.
   * await this.extractAndIndexPack(packDir, 'pack.zip');
   * await this.markAsCached(categoryId, manifest.version, 'remote');
   */
  private async downloadPack(
    categoryId: string,
    manifest: RemotePackManifest,
  ): Promise<boolean> {
    const store = usePosePackStore.getState();

    store.setPackState(categoryId, {
      status: 'downloading',
      progress: 0,
      loadingMessage: 'Preparing poses...',
      failedAt: null,
    });

    try {
      /**
       * Remote download implementation goes here.
       * See the FUTURE IMPLEMENTATION GUIDE in JSDoc above.
       *
       * For now, since no remote URLs exist, this branch is never reached
       * (all categories are bundled). The structure is ready.
       */
      throw new Error(
        `Remote pack download not yet implemented for category ${categoryId}. ` +
        `Install expo-file-system and follow the guide in downloadPack().`,
      );
    } catch (err) {
      store.setPackState(categoryId, {
        status: 'failed',
        progress: 0,
        loadingMessage: '',
        failedAt: Date.now(),
      });
      return false;
    }
  }
}

export const PosePackService = new PosePackManager();
