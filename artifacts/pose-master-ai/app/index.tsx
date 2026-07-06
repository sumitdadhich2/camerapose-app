import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useRecentStore } from '../store/useRecentStore';
import { LoadingScreen } from '../components/LoadingScreen';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const { user, hasSeenOnboarding, loadState: loadAuth } = useAuthStore();
  const { loadState: loadSettings } = useSettingsStore();
  const { loadState: loadFavorites } = useFavoritesStore();
  const { loadState: loadRecent } = useRecentStore();

  useEffect(() => {
    async function init() {
      await Promise.all([
        loadAuth(),
        loadSettings(),
        loadFavorites(),
        loadRecent(),
      ]);
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
