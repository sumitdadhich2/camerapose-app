/**
 * usePosePackStore
 * ================
 * Per-category pose pack download and cache state.
 *
 * Updated exclusively by PosePackService — do not call setPackState
 * from UI components directly.
 *
 * UI components should read this store to decide what to display:
 *   const packState = usePosePackStore(s => s.packs[categoryId]);
 */

import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PackStatus =
  | 'cached'       // Available locally — open instantly
  | 'downloading'  // Download in progress
  | 'failed'       // Last download attempt failed — show retry
  | 'not_cached';  // Not downloaded yet (remote-only categories)

export interface CategoryPackState {
  status: PackStatus;
  /** Download progress (0–1). Only meaningful when status === 'downloading'. */
  progress: number;
  /** Current friendly loading message. Empty when not downloading. */
  loadingMessage: string;
  /** Installed version string. null when not cached. */
  version: string | null;
  /** Unix timestamp when this pack was last successfully cached. */
  cachedAt: number | null;
  /** Unix timestamp of the last failed attempt. null if never failed. */
  failedAt: number | null;
}

interface PosePackState {
  /** Pack state keyed by category ID. */
  packs: Record<string, CategoryPackState>;
  /**
   * Update (merge) the state for a single category.
   * Called by PosePackService only.
   */
  setPackState: (
    categoryId: string,
    state: Partial<CategoryPackState>,
  ) => void;
}

// ─── Default state ────────────────────────────────────────────────────────────

const DEFAULT_PACK_STATE: CategoryPackState = {
  status: 'not_cached',
  progress: 0,
  loadingMessage: '',
  version: null,
  cachedAt: null,
  failedAt: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePosePackStore = create<PosePackState>((set) => ({
  packs: {},

  setPackState: (categoryId, update) =>
    set((state) => ({
      packs: {
        ...state.packs,
        [categoryId]: {
          ...(state.packs[categoryId] ?? DEFAULT_PACK_STATE),
          ...update,
        },
      },
    })),
}));
