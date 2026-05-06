import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'CardVault',
  slug: 'cardvault',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'cardvault',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0f1115',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cardvault.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0f1115',
    },
    package: 'com.cardvault.app',
  },
  plugins: [
    'expo-asset',
    'expo-router',
    'expo-dev-client',
    [
      'expo-image-picker',
      {
        photosPermission: 'CardVault needs photo access to scan cards.',
        cameraPermission: 'CardVault needs camera access to scan cards.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
