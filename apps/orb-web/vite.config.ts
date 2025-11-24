import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

import { apiPlugin } from './vite-plugin-api';

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@orb-system/core-orb': path.resolve(__dirname, '../../orb-system/packages/core-orb/src'),
      '@orb-system/core-sol': path.resolve(__dirname, '../../packages/core-sol/src'),
      '@orb-system/core-te': path.resolve(__dirname, '../../packages/core-te/src'),
      '@orb-system/core-mav': path.resolve(__dirname, '../../packages/core-mav/src'),
      '@orb-system/core-luna': path.resolve(__dirname, '../../packages/core-luna/src'),
      '@orb-system/forge': path.resolve(__dirname, '../../packages/forge/src'),
    },
  },
  server: {
    port: 4321,
  },
  // Load .env files from monorepo root
  envDir: path.resolve(__dirname, '../..'),
});
