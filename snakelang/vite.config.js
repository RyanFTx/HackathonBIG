import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Move index.html to public directory
  publicDir: 'public',

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },

  server: {
    port: 3000,
    open: true
  }
})