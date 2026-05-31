/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Karen Roses brand palette — mirrors the web app's design tokens
 * (Frontend/shared/theme.css) so the native app stays visually consistent with
 * the customer portal / webshop / CRM it shares a backend with.
 */
export const Brand = {
  green: '#3a5a48',
  greenDark: '#2c4537',
  greenSoft: '#e8efe9',
  maroon: '#7a1f2b',
  maroonSoft: '#f3e3e5',
  gold: '#c9a96e',

  bg: '#fafaf7',
  surface: '#ffffff',
  surface2: '#f4f2ec',
  border: '#e3e0d6',
  border2: '#cdc9bd',

  text: '#1a1a1a',
  text2: '#5a5852',
  text3: '#8e8b80',

  good: '#2d6a4f',
  goodSoft: '#e6f0ea',
  bad: '#b42318',
  badSoft: '#fbe5e7',
  warn: '#9a6700',
  warnSoft: '#faf0d0',
  info: '#175cd3',
  infoSoft: '#e0eaff',
} as const;
