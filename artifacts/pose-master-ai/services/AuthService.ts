import { UserProfile } from '../types';

export const AuthService = {
  async signInWithGoogle(): Promise<UserProfile> {
    // Placeholder for Google Sign-In
    // TODO: Wire up real Google Sign-In SDK
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'user_123',
          name: 'Google User',
          isGuest: false,
          isPremium: false,
        });
      }, 1000);
    });
  },

  async signInAsGuest(): Promise<UserProfile> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'guest_' + Math.random().toString(36).substr(2, 9),
          name: 'Guest',
          isGuest: true,
          isPremium: false,
        });
      }, 500);
    });
  },

  async signOut(): Promise<void> {
    // Placeholder for Sign Out
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
};
