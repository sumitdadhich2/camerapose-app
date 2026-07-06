/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: "#050505",
    tint: "#FFD54F",
    background: "#f5f5f5",
    foreground: "#050505",
    card: "#ffffff",
    cardForeground: "#050505",
    primary: "#FFD54F",
    primaryForeground: "#000000",
    secondary: "#e5e5e5",
    secondaryForeground: "#1a1a1a",
    muted: "#e5e5e5",
    mutedForeground: "#737373",
    accent: "#FFD54F",
    accentForeground: "#000000",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#d4d4d4",
    input: "#d4d4d4",
  },
  dark: {
    text: "#ffffff",
    tint: "#FFD54F",
    background: "#050505",
    foreground: "#ffffff",
    card: "#1a1a1a",
    cardForeground: "#ffffff",
    primary: "#FFD54F",
    primaryForeground: "#000000",
    secondary: "#2a2a2a",
    secondaryForeground: "#ffffff",
    muted: "#2a2a2a",
    mutedForeground: "#a0a0a0",
    accent: "#FFD54F",
    accentForeground: "#000000",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#333333",
    input: "#333333",
  },
  radius: 16,
};

export default colors;
