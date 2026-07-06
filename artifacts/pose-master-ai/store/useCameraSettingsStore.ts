import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface CameraSettingsState {
  quality: 'High' | 'Medium' | 'Low';
  grid: boolean;
  mirrorSelfie: boolean;
  captureSound: boolean;
  saveLocation: boolean;
  imageQuality: 'JPEG' | 'PNG' | 'RAW';
  setQuality: (val: 'High' | 'Medium' | 'Low') => void;
  setGrid: (val: boolean) => void;
  setMirrorSelfie: (val: boolean) => void;
  setCaptureSound: (val: boolean) => void;
  setSaveLocation: (val: boolean) => void;
  setImageQuality: (val: 'JPEG' | 'PNG' | 'RAW') => void;
  loadState: () => Promise<void>;
}

export const useCameraSettingsStore = create<CameraSettingsState>((set) => ({
  quality: 'High',
  grid: false,
  mirrorSelfie: true,
  captureSound: true,
  saveLocation: false,
  imageQuality: 'JPEG',
  setQuality: (quality) => {
    set({ quality });
    StorageService.setItem('camera_quality', quality);
  },
  setGrid: (grid) => {
    set({ grid });
    StorageService.setItem('camera_grid', grid);
  },
  setMirrorSelfie: (mirrorSelfie) => {
    set({ mirrorSelfie });
    StorageService.setItem('camera_mirrorSelfie', mirrorSelfie);
  },
  setCaptureSound: (captureSound) => {
    set({ captureSound });
    StorageService.setItem('camera_captureSound', captureSound);
  },
  setSaveLocation: (saveLocation) => {
    set({ saveLocation });
    StorageService.setItem('camera_saveLocation', saveLocation);
  },
  setImageQuality: (imageQuality) => {
    set({ imageQuality });
    StorageService.setItem('camera_imageQuality', imageQuality);
  },
  loadState: async () => {
    const quality = await StorageService.getItem<'High' | 'Medium' | 'Low'>('camera_quality');
    const grid = await StorageService.getItem<boolean>('camera_grid');
    const mirrorSelfie = await StorageService.getItem<boolean>('camera_mirrorSelfie');
    const captureSound = await StorageService.getItem<boolean>('camera_captureSound');
    const saveLocation = await StorageService.getItem<boolean>('camera_saveLocation');
    const imageQuality = await StorageService.getItem<'JPEG' | 'PNG' | 'RAW'>('camera_imageQuality');

    set((state) => ({
      quality: quality ?? state.quality,
      grid: grid ?? state.grid,
      mirrorSelfie: mirrorSelfie ?? state.mirrorSelfie,
      captureSound: captureSound ?? state.captureSound,
      saveLocation: saveLocation ?? state.saveLocation,
      imageQuality: imageQuality ?? state.imageQuality,
    }));
  }
}));
