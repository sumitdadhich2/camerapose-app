import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface RecentState {
  recentCategories: string[];
  recentTemplates: string[];
  addRecentCategory: (id: string) => void;
  addRecentTemplate: (id: string) => void;
  loadState: () => Promise<void>;
}

export const useRecentStore = create<RecentState>((set, get) => ({
  recentCategories: [],
  recentTemplates: [],
  addRecentCategory: (id) => {
    const current = get().recentCategories;
    const newRecent = [id, ...current.filter(c => c !== id)].slice(0, 10);
    set({ recentCategories: newRecent });
    StorageService.setItem('recentCategories', newRecent);
  },
  addRecentTemplate: (id) => {
    const current = get().recentTemplates;
    const newRecent = [id, ...current.filter(t => t !== id)].slice(0, 10);
    set({ recentTemplates: newRecent });
    StorageService.setItem('recentTemplates', newRecent);
  },
  loadState: async () => {
    const categories = await StorageService.getItem<string[]>('recentCategories') || [];
    const templates = await StorageService.getItem<string[]>('recentTemplates') || [];
    set({ recentCategories: categories, recentTemplates: templates });
  }
}));
