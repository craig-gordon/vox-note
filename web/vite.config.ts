import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js']
  },
  optimizeDeps: {
    include: ['react-native-web', '@journaling-app/shared', 'react-native-calendars'],
    esbuildOptions: {
      jsx: 'automatic',
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  build: {
    commonjsOptions: {
      include: [/shared/, /node_modules/]
    }
  },
})
