import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/towerInspections-v1.1/',
  build: {
    outDir: 'dist'
  }
})
