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
      backgroundColor: '#3880ff', // Color principal de tu app
      style: 'light',
      overlaysWebView: false,
    },
  },
  android: {
    backgroundColor: '#3880ff', // Color principal de tu app
    allowMixedContent: true,
  },
};

export default config;
