import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

type ConfigContext = {
  config: ExpoConfig;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FocusPlan',
  slug: 'focusplan',
  version: '0.1.0',
  scheme: 'focusplan',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.focusplan.app',
    infoPlist: {
      NSCalendarsUsageDescription: 'FocusPlan needs calendar access to sync your tasks.'
    }
  },
  android: {
    package: 'com.focusplan.app',
    permissions: ['android.permission.WRITE_CALENDAR', 'android.permission.READ_CALENDAR']
  },
  web: {
    bundler: 'metro',
    output: 'single'
  },
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000'
    },
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? '',
    googleAndroidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID ?? '',
    googleIOSClientId: process.env.GOOGLE_IOS_CLIENT_ID ?? '',
    googleExpoClientId: process.env.GOOGLE_EXPO_CLIENT_ID ?? '',
    googleApiKey: process.env.GOOGLE_API_KEY ?? ''
  }
});
