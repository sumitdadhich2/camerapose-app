import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useNativeColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';

interface ThemeContextValue {
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({ colorScheme: 'dark' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const nativeColorScheme = useNativeColorScheme();
  const { isDarkMode, loadState } = useSettingsStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadState().then(() => setIsReady(true));
  }, []);

  // Determine actual color scheme
  let colorScheme: 'light' | 'dark' = 'dark'; // Default to dark for this premium app if unknown
  
  if (isDarkMode === true) {
    colorScheme = 'dark';
  } else if (isDarkMode === false) {
    colorScheme = 'light';
  } else {
    // If null, use system
    colorScheme = nativeColorScheme === 'light' ? 'light' : 'dark';
  }

  // We could theoretically inject this context into a modified useColors hook, 
  // but since we are overriding, we will just provide it for components that need it.

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={{ colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => useContext(ThemeContext);
