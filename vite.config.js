import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Three real HTML files, so every screen has its own path and needs no router.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        'quan-ly': 'quan-ly.html',
        'lich-chup': 'lich-chup.html',
      },
    },
  },
});
