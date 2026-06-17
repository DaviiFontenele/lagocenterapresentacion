import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets path for GitHub Pages deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Force UTF-8 charset to preserve Portuguese accents in minified output
    target: 'esnext',
  },
  esbuild: {
    charset: 'utf8',
  },
  server: {
    port: 3000,
  }
});
