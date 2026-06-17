import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets path for GitHub Pages deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  }
});
