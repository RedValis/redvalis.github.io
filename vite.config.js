import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                 // for redvalis.github.io user site
  assetsInclude: ['**/*.glb']
})