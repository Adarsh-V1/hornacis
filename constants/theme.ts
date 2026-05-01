import { Platform } from 'react-native';

export const lightTheme = {
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.6)',
  border: 'rgba(0,0,0,0.08)',

  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  accent: '#00C2FF',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  onPrimary: '#FFFFFF',

  shadow: 'rgba(0,0,0,0.08)',
  glowAccent: 'rgba(108,99,255,0.25)',
} as const;

export const darkTheme = {
  bg: '#0B0F19',
  surface: '#121826',
  glass: 'rgba(18,24,38,0.6)',
  border: 'rgba(255,255,255,0.08)',

  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  accent: '#22D3EE',
  gold: '#EAB308',

  text: '#E5E7EB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  onPrimary: '#FFFFFF',

  shadow: 'rgba(0,0,0,0.4)',
  glowPurple: 'rgba(139,92,246,0.35)',
  glowCyan: 'rgba(34,211,238,0.25)',
  glowGold: 'rgba(234,179,8,0.4)',
} as const;

export const Colors = {
  light: {
    text: lightTheme.text,
    background: lightTheme.bg,
    tint: lightTheme.primary,
    icon: lightTheme.textMuted,
    tabIconDefault: lightTheme.textMuted,
    tabIconSelected: lightTheme.primary,
  },
  dark: {
    text: darkTheme.text,
    background: darkTheme.bg,
    tint: darkTheme.primary,
    icon: darkTheme.textMuted,
    tabIconDefault: darkTheme.textMuted,
    tabIconSelected: darkTheme.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
