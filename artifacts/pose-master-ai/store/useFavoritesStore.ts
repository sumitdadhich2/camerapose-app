import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface FavoritesState {
  favoriteCategoryIds: string[];
  favoritePoseIds: string[];
  toggleFavoriteCategory: (id: string) => void;
  toggleFavoritePose: (id: string) => void;
  loadState: () => Promise<void>;
  // For backwards compatibility
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteCategoryIds: [],
  favoritePoseIds: [],
  favoriteIds: [], // mapped to pose ids for old usage
  toggleFavoriteCategory: (id) => {
    const current = get().favoriteCategoryIds;
    const newFavorites = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    set({ favoriteCategoryIds: newFavorites });
    StorageService.setItem('favoriteCategories', newFavorites);
  },
  toggleFavoritePose: (id) => {
    const current = get().favoritePoseIds;
    const newFavorites = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    set({ favoritePoseIds: newFavorites, favoriteIds: newFavorites });
    StorageService.setItem('favoritePoses', newFavorites);
  },
  toggleFavorite: (id) => {
    get().toggleFavoritePose(id);
  },
  loadState: async () => {
    const cat = await StorageService.getItem<string[]>('favoriteCategories') || [];
    const poses = await StorageService.getItem<string[]>('favoritePoses') || [];
    set({ favoriteCategoryIds: cat, favoritePoseIds: poses, favoriteIds: poses });
  }
}));
