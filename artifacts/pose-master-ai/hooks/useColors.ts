import { useColorScheme } from "react-native";
import { useSettingsStore } from "../store/useSettingsStore";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 */
export function useColors() {
  const scheme = useColorScheme();
  const storeDarkMode = useSettingsStore(s => s.isDarkMode);
  
  let activeScheme = scheme === 'light' ? 'light' : 'dark';
  if (storeDarkMode === true) activeScheme = 'dark';
  if (storeDarkMode === false) activeScheme = 'light';
  
  const palette =
    activeScheme === "dark" && "dark" in colors ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}

