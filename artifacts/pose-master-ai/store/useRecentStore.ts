import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface RecentState {
  recentCategories: string[];
  recentTemplates: string[];
  continueLastPoseId: string | null;
  addRecentCategory: (id: string) => void;
  addRecentTemplate: (id: string) => void;
  loadState: () => Promise<void>;
}

export const useRecentStore = create<RecentState>((set, get) => ({
  recentCategories: [],
  recentTemplates: [],
  continueLastPoseId: null,
  addRecentCategory: (id) => {
    const current = get().recentCategories;
    const newRecent = [id, ...current.filter(c => c !== id)].slice(0, 10);
    set({ recentCategories: newRecent });
    StorageService.setItem('recentCategories', newRecent);
  },
  addRecentTemplate: (id) => {
    const current = get().recentTemplates;
    const newRecent = [id, ...current.filter(t => t !== id)].slice(0, 20);
    set({ recentTemplates: newRecent, continueLastPoseId: id });
    StorageService.setItem('recentTemplates', newRecent);
    StorageService.setItem('continueLastPoseId', id);
  },
  loadState: async () => {
    const categories = await StorageService.getItem<string[]>('recentCategories') || [];
    const templates = await StorageService.getItem<string[]>('recentTemplates') || [];
    const lastPose = await StorageService.getItem<string>('continueLastPoseId') || null;
    set({ recentCategories: categories, recentTemplates: templates, continueLastPoseId: lastPose });
  }
}));
