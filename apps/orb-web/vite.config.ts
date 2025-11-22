import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

import { apiPlugin } from './vite-plugin-api';

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4321,
  },
});
