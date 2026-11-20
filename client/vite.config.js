import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One page with React Router (BrowserRouter). Assets from the root, so a nested route such as /lich-chup/GS-1024 still
// finds them. The client calls only relative /api paths; both the dev server and the preview forward them to the mock
// (PA#3) or the Express server (PA#4) on port 3001.
const api = { '/api': 'http://localhost:3001' };

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
});
