import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hyten.workout',
  appName: 'HyTen',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
