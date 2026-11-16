import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Optimizado 100% Client-Side para despliegue gratuito en GitHub Pages (cualquier subruta /usuario/repo)
export default defineConfig({
  base: './',
  cacheDir: '/tmp/neumalab-vite-cache',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  plugins: [react(), tailwindcss()],
});
