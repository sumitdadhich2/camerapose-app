import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

export interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

interface CapturedPhotosState {
  photos: CapturedPhoto[];
  addPhoto: (photo: CapturedPhoto) => void;
  removePhoto: (id: string) => void;
  loadPhotos: () => Promise<void>;
}

export const useCapturedPhotosStore = create<CapturedPhotosState>((set, get) => ({
  photos: [],
  addPhoto: (photo) => {
    const newPhotos = [photo, ...get().photos];
    set({ photos: newPhotos });
    StorageService.setItem('captured_photos', newPhotos);
  },
  removePhoto: (id) => {
    const newPhotos = get().photos.filter((p) => p.id !== id);
    set({ photos: newPhotos });
    StorageService.setItem('captured_photos', newPhotos);
  },
  loadPhotos: async () => {
    const photos = await StorageService.getItem<CapturedPhoto[]>('captured_photos');
    if (photos) {
      set({ photos });
    }
  }
}));
