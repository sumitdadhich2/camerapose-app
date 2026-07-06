import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface SettingsState {
  isDarkMode: boolean | null; // null means system default
  language: string;
  setDarkMode: (isDark: boolean | null) => void;
  setLanguage: (lang: string) => void;
  loadState: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDarkMode: null,
  language: 'en',
  setDarkMode: (isDarkMode) => {
    set({ isDarkMode });
    StorageService.setItem('isDarkMode', isDarkMode);
  },
  setLanguage: (language) => {
    set({ language });
    StorageService.setItem('language', language);
  },
  loadState: async () => {
    const isDarkMode = await StorageService.getItem<boolean | null>('isDarkMode');
    const language = await StorageService.getItem<string>('language') || 'en';
    set({ isDarkMode, language });
  }
}));
