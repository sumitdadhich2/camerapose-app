import { create } from 'zustand';
import { StorageService } from '../services/StorageService';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  hasSeenOnboarding: boolean;
  setUser: (user: UserProfile | null) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  loadState: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hasSeenOnboarding: false,
  setUser: (user) => {
    set({ user });
    StorageService.setItem('user', user);
  },
  setHasSeenOnboarding: (seen) => {
    set({ hasSeenOnboarding: seen });
    StorageService.setItem('hasSeenOnboarding', seen);
  },
  loadState: async () => {
    const user = await StorageService.getItem<UserProfile>('user');
    const hasSeenOnboarding = await StorageService.getItem<boolean>('hasSeenOnboarding');
    set({ user, hasSeenOnboarding: !!hasSeenOnboarding });
  }
}));
