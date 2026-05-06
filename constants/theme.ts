import { Platform } from 'react-native';

/** Central palette — dark-mode-first collection UI */
export const colors = {
  bg: '#0b0d11',
  surface: '#12151c',
  surfaceElevated: '#181c26',
  border: '#242a36',
  text: '#f2f4f8',
  textMuted: '#9aa3b2',
  accent: '#5b8cff',
  accentMuted: '#3d5a99',
  danger: '#ff6b6b',
  success: '#46d4a1',
  overlay: 'rgba(0,0,0,0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const typography = {
  title: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};
