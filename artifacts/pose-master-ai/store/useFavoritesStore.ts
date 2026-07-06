import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (templateId: string) => void;
  loadState: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],
  toggleFavorite: (templateId) => {
    const current = get().favoriteIds;
    const newFavorites = current.includes(templateId)
      ? current.filter(id => id !== templateId)
      : [...current, templateId];
    
    set({ favoriteIds: newFavorites });
    StorageService.setItem('favorites', newFavorites);
  },
  loadState: async () => {
    const favorites = await StorageService.getItem<string[]>('favorites') || [];
    set({ favoriteIds: favorites });
  }
}));
