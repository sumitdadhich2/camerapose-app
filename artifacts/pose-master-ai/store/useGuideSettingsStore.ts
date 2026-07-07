import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

interface GuideSettingsState {
  cameraGuide: boolean;
  voiceGuide: boolean;
  autoCapture: boolean;
  overlayOpacity: number; // 0–100
  animationSpeed: AnimationSpeed;

  setCameraGuide(v: boolean): void;
  setVoiceGuide(v: boolean): void;
  setAutoCapture(v: boolean): void;
  setOverlayOpacity(v: number): void;
  setAnimationSpeed(v: AnimationSpeed): void;
  loadState(): Promise<void>;
}

export const useGuideSettingsStore = create<GuideSettingsState>((set) => ({
  cameraGuide: true,
  voiceGuide: false,
  autoCapture: false,
  overlayOpacity: 80,
  animationSpeed: 'normal',

  setCameraGuide: (cameraGuide) => {
    set({ cameraGuide });
    StorageService.setItem('guide_cameraGuide', cameraGuide);
  },
  setVoiceGuide: (voiceGuide) => {
    set({ voiceGuide });
    StorageService.setItem('guide_voiceGuide', voiceGuide);
  },
  setAutoCapture: (autoCapture) => {
    set({ autoCapture });
    StorageService.setItem('guide_autoCapture', autoCapture);
  },
  setOverlayOpacity: (overlayOpacity) => {
    set({ overlayOpacity });
    StorageService.setItem('guide_overlayOpacity', overlayOpacity);
  },
  setAnimationSpeed: (animationSpeed) => {
    set({ animationSpeed });
    StorageService.setItem('guide_animationSpeed', animationSpeed);
  },

  loadState: async () => {
    const [cameraGuide, voiceGuide, autoCapture, overlayOpacity, animationSpeed] =
      await Promise.all([
        StorageService.getItem<boolean>('guide_cameraGuide'),
        StorageService.getItem<boolean>('guide_voiceGuide'),
        StorageService.getItem<boolean>('guide_autoCapture'),
        StorageService.getItem<number>('guide_overlayOpacity'),
        StorageService.getItem<AnimationSpeed>('guide_animationSpeed'),
      ]);
    set({
      ...(cameraGuide !== null ? { cameraGuide } : {}),
      ...(voiceGuide !== null ? { voiceGuide } : {}),
      ...(autoCapture !== null ? { autoCapture } : {}),
      ...(overlayOpacity !== null ? { overlayOpacity } : {}),
      ...(animationSpeed !== null ? { animationSpeed } : {}),
    });
  },
}));
