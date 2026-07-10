import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

export interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: number;
  // Pose context — populated from camera screen
  poseId?: string;
  poseName?: string;
  categoryId?: string;
  categoryName?: string;
  // Camera state
  facingCamera?: 'front' | 'back';
  // User data
  isFavorite?: boolean;
  customName?: string;
  collectionIds?: string[];
}

interface CapturedPhotosState {
  photos: CapturedPhoto[];
  addPhoto: (photo: CapturedPhoto) => void;
  removePhoto: (id: string) => void;
  removePhotos: (ids: string[]) => void;
  clearAllPhotos: () => void;
  updatePhoto: (id: string, updates: Partial<CapturedPhoto>) => void;
  toggleFavorite: (id: string) => void;
  loadPhotos: () => Promise<void>;
}

const STORAGE_KEY = 'captured_photos';

export const useCapturedPhotosStore = create<CapturedPhotosState>((set, get) => ({
  photos: [],

  addPhoto: (photo) => {
    const newPhotos = [photo, ...get().photos];
    set({ photos: newPhotos });
    StorageService.setItem(STORAGE_KEY, newPhotos);
  },

  removePhoto: (id) => {
    const newPhotos = get().photos.filter((p) => p.id !== id);
    set({ photos: newPhotos });
    StorageService.setItem(STORAGE_KEY, newPhotos);
  },

  removePhotos: (ids) => {
    const idSet = new Set(ids);
    const newPhotos = get().photos.filter((p) => !idSet.has(p.id));
    set({ photos: newPhotos });
    StorageService.setItem(STORAGE_KEY, newPhotos);
  },

  clearAllPhotos: () => {
    set({ photos: [] });
    StorageService.setItem(STORAGE_KEY, []);
  },

  updatePhoto: (id, updates) => {
    const newPhotos = get().photos.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    );
    set({ photos: newPhotos });
    StorageService.setItem(STORAGE_KEY, newPhotos);
  },

  toggleFavorite: (id) => {
    const photo = get().photos.find((p) => p.id === id);
    if (!photo) return;
    get().updatePhoto(id, { isFavorite: !photo.isFavorite });
  },

  loadPhotos: async () => {
    const photos = await StorageService.getItem<CapturedPhoto[]>(STORAGE_KEY);
    if (photos) set({ photos });
  },
}));
