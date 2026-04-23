import type { TextStyle, ViewStyle } from "react-native";

// Apple-inspired design tokens for Sarafu Network
export const colors = {
  // Brand
  primary: "#16a34a",
  primaryLight: "#dcfce7",
  primarySoft: "rgba(22,163,74,0.08)",

  // iOS System Backgrounds
  background: "#F2F2F7",
  surface: "#FFFFFF",
  secondaryBackground: "#F2F2F7",
  tertiaryBackground: "#FFFFFF",

  // iOS System Labels
  label: "#000000",
  secondaryLabel: "rgba(60,60,67,0.6)",
  tertiaryLabel: "rgba(60,60,67,0.3)",
  quaternaryLabel: "rgba(60,60,67,0.18)",

  // iOS System Fills
  fill: "rgba(120,120,128,0.2)",
  secondaryFill: "rgba(120,120,128,0.16)",
  tertiaryFill: "rgba(120,120,128,0.12)",
  quaternaryFill: "rgba(120,120,128,0.08)",

  // Separators
  separator: "rgba(60,60,67,0.12)",
  opaqueSeparator: "#C6C6C8",

  // System Colors
  red: "#FF3B30",
  orange: "#FF9500",
  yellow: "#FFCC00",
  green: "#34C759",
  blue: "#007AFF",
  indigo: "#5856D6",
  purple: "#AF52DE",
  pink: "#FF2D55",
  teal: "#5AC8FA",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 9999,
} as const;

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  } satisfies ViewStyle,
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  } satisfies ViewStyle,
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  } satisfies ViewStyle,
  colored: (color: string) =>
    ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    }) satisfies ViewStyle,
};

// Apple Human Interface typography scale
export const type = {
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.37,
  } satisfies TextStyle,
  title1: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.36,
  } satisfies TextStyle,
  title2: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.35,
  } satisfies TextStyle,
  title3: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.38,
  } satisfies TextStyle,
  headline: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.41,
  } satisfies TextStyle,
  body: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.41,
  } satisfies TextStyle,
  callout: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.32,
  } satisfies TextStyle,
  subheadline: {
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.24,
  } satisfies TextStyle,
  footnote: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.08,
  } satisfies TextStyle,
  caption1: {
    fontSize: 12,
    fontWeight: "400",
  } satisfies TextStyle,
  caption2: {
    fontSize: 11,
    fontWeight: "400",
  } satisfies TextStyle,
};

// Shared card style for iOS grouped appearance
export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  ...shadow.sm,
} satisfies ViewStyle;

// iOS-style section header
export const sectionHeader = {
  fontSize: 13,
  fontWeight: "600",
  letterSpacing: -0.08,
  color: colors.secondaryLabel,
  textTransform: "uppercase",
  marginBottom: 8,
  paddingHorizontal: 4,
} satisfies TextStyle;
