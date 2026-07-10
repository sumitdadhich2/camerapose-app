/**
 * useDevModeStore
 * ===============
 * Developer Mode settings for Pose Master AI.
 *
 * All flags default to false (OFF). Developer Mode must be explicitly enabled
 * before any debug overlay features become visible in the camera UI.
 *
 * The debug overlay is only meaningful when a real pose detector is connected.
 * In the current unavailable state it renders nothing even when enabled.
 *
 * Persistence: all flags are persisted via StorageService.
 */

import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface DevModeState {
  /** Master switch — all debug features are gated behind this. Default: false. */
  developerMode: boolean;
  /** Show the debug overlay layer on the camera view. Default: false. */
  debugOverlay: boolean;
  /** Draw detected body landmark points on the overlay. Default: false. */
  showLandmarks: boolean;
  /** Draw detected body point labels on the overlay. Default: false. */
  showBodyPoints: boolean;
  /** Show numeric debug values (scores, confidence, frame index). Default: false. */
  showDebugValues: boolean;

  setDeveloperMode(v: boolean): void;
  setDebugOverlay(v: boolean): void;
  setShowLandmarks(v: boolean): void;
  setShowBodyPoints(v: boolean): void;
  setShowDebugValues(v: boolean): void;
  loadState(): Promise<void>;
}

export const useDevModeStore = create<DevModeState>((set) => ({
  developerMode: false,
  debugOverlay: false,
  showLandmarks: false,
  showBodyPoints: false,
  showDebugValues: false,

  setDeveloperMode: (developerMode) => {
    set({ developerMode });
    StorageService.setItem('dev_developerMode', developerMode);
    // When developer mode is turned off, reset all sub-flags.
    if (!developerMode) {
      set({ debugOverlay: false, showLandmarks: false, showBodyPoints: false, showDebugValues: false });
      StorageService.setItem('dev_debugOverlay', false);
      StorageService.setItem('dev_showLandmarks', false);
      StorageService.setItem('dev_showBodyPoints', false);
      StorageService.setItem('dev_showDebugValues', false);
    }
  },

  setDebugOverlay: (debugOverlay) => {
    set({ debugOverlay });
    StorageService.setItem('dev_debugOverlay', debugOverlay);
  },

  setShowLandmarks: (showLandmarks) => {
    set({ showLandmarks });
    StorageService.setItem('dev_showLandmarks', showLandmarks);
  },

  setShowBodyPoints: (showBodyPoints) => {
    set({ showBodyPoints });
    StorageService.setItem('dev_showBodyPoints', showBodyPoints);
  },

  setShowDebugValues: (showDebugValues) => {
    set({ showDebugValues });
    StorageService.setItem('dev_showDebugValues', showDebugValues);
  },

  loadState: async () => {
    const [developerMode, debugOverlay, showLandmarks, showBodyPoints, showDebugValues] =
      await Promise.all([
        StorageService.getItem<boolean>('dev_developerMode'),
        StorageService.getItem<boolean>('dev_debugOverlay'),
        StorageService.getItem<boolean>('dev_showLandmarks'),
        StorageService.getItem<boolean>('dev_showBodyPoints'),
        StorageService.getItem<boolean>('dev_showDebugValues'),
      ]);

    set({
      ...(developerMode !== null ? { developerMode } : {}),
      ...(debugOverlay !== null ? { debugOverlay } : {}),
      ...(showLandmarks !== null ? { showLandmarks } : {}),
      ...(showBodyPoints !== null ? { showBodyPoints } : {}),
      ...(showDebugValues !== null ? { showDebugValues } : {}),
    });
  },
}));
