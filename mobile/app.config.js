import 'dotenv/config'

export default {
  expo: {
    name: 'Vox Note',
    slug: 'journaling-app',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#f5f5f5',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.journalingapp.mobile',
      infoPlist: {
        NSMicrophoneUsageDescription:
          'This app uses the microphone to record your voice for transcription.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#f5f5f5',
      },
      package: 'com.journalingapp.mobile',
      permissions: ['android.permission.RECORD_AUDIO'],
    },
    extra: {
      openaiApiKey: process.env.VITE_OPENAI_API_KEY,
      neonDatabaseUrl: process.env.VITE_NEON_DATABASE_CONNECTION_STRING,
    },
    jsEngine: "hermes"
  },
}
