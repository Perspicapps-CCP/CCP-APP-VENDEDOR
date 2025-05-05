import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proyecto_grupo_3_vendedor.ccp',
  appName: 'ccp',
  webDir: 'www',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      backgroundColor: '#3880ff',
      style: 'light',
      overlaysWebView: false,
    },
    Camera: {
      androidUseMaxAspectRatio: true,
    },
  },
  android: {
    backgroundColor: '#3880ff',
    allowMixedContent: true,
    appendUserAgent: 'HighMemoryApp',
  },
};

export default config;
