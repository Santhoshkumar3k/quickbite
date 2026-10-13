import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../QuickBite.Api/wwwroot'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      },
      '/dapi': {
        target: 'http://localhost:5004',
        changeOrigin: true,
      },
      '/hubs': {
        target: 'http://localhost:5004',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})
