import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

export interface PhotoCollection {
  id: string;
  name: string;
  icon: string;
  color: string;
  photoIds: string[];
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

const DEFAULT_COLLECTIONS: PhotoCollection[] = [
  { id: 'col_travel',      name: 'Travel',      icon: 'airplane',      color: '#64B5F6', photoIds: [], createdAt: 0, updatedAt: 0, isDefault: true },
  { id: 'col_wedding',     name: 'Wedding',      icon: 'diamond',       color: '#F48FB1', photoIds: [], createdAt: 0, updatedAt: 0, isDefault: true },
  { id: 'col_instagram',   name: 'Instagram',    icon: 'camera',        color: '#CE93D8', photoIds: [], createdAt: 0, updatedAt: 0, isDefault: true },
  { id: 'col_traditional', name: 'Traditional',  icon: 'ribbon',        color: '#FFCC80', photoIds: [], createdAt: 0, updatedAt: 0, isDefault: true },
  { id: 'col_family',      name: 'Family',       icon: 'home',          color: '#A5D6A7', photoIds: [], createdAt: 0, updatedAt: 0, isDefault: true },
];

const STORAGE_KEY = 'photo_collections';

interface CollectionsState {
  collections: PhotoCollection[];
  createCollection: (name: string, icon?: string, color?: string) => PhotoCollection;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addPhotoToCollection: (collectionId: string, photoId: string) => void;
  removePhotoFromCollection: (collectionId: string, photoId: string) => void;
  removePhotoFromAllCollections: (photoId: string) => void;
  loadCollections: () => Promise<void>;
}

const COLLECTION_COLORS = [
  '#FFD54F', '#F48FB1', '#64B5F6', '#A5D6A7',
  '#CE93D8', '#FFCC80', '#80DEEA', '#EF9A9A',
];

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: DEFAULT_COLLECTIONS,

  createCollection: (name, icon = 'folder', color) => {
    const existingColors = get().collections.map((c) => c.color);
    const unusedColor =
      COLLECTION_COLORS.find((c) => !existingColors.includes(c)) ??
      COLLECTION_COLORS[get().collections.length % COLLECTION_COLORS.length];

    const col: PhotoCollection = {
      id: `col_${Date.now()}`,
      name,
      icon,
      color: color ?? unusedColor,
      photoIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...get().collections, col];
    set({ collections: updated });
    StorageService.setItem(STORAGE_KEY, updated);
    return col;
  },

  renameCollection: (id, name) => {
    const updated = get().collections.map((c) =>
      c.id === id ? { ...c, name, updatedAt: Date.now() } : c,
    );
    set({ collections: updated });
    StorageService.setItem(STORAGE_KEY, updated);
  },

  deleteCollection: (id) => {
    const updated = get().collections.filter((c) => c.id !== id);
    set({ collections: updated });
    StorageService.setItem(STORAGE_KEY, updated);
  },

  addPhotoToCollection: (collectionId, photoId) => {
    const updated = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      if (c.photoIds.includes(photoId)) return c;
      return { ...c, photoIds: [photoId, ...c.photoIds], updatedAt: Date.now() };
    });
    set({ collections: updated });
    StorageService.setItem(STORAGE_KEY, updated);
  },

  removePhotoFromCollection: (collectionId, photoId) => {
    const updated = get().collections.map((c) =>
      c.id === collectionId
        ? { ...c, photoIds: c.photoIds.filter((id) => id !== photoId), updatedAt: Date.now() }
        : c,
    );
    set({ collections: updated });
    StorageService.setItem(STORAGE_KEY, updated);
  },

  removePhotoFromAllCollections: (photoId) => {
    const updated = get().collections.map((c) => ({
      ...c,
      photoIds: c.photoIds.filter((id) => id !== photoId),
    }));
    set({ collections: updated });
    StorageService.setItem(STORAGE_KEY, updated);
  },

  loadCollections: async () => {
    const saved = await StorageService.getItem<PhotoCollection[]>(STORAGE_KEY);
    if (saved && saved.length > 0) {
      // Merge saved with any new defaults not yet in storage
      const savedIds = new Set(saved.map((c) => c.id));
      const newDefaults = DEFAULT_COLLECTIONS.filter((d) => !savedIds.has(d.id));
      set({ collections: [...saved, ...newDefaults] });
    }
  },
}));
