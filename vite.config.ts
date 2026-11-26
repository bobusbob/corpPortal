import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Относительные пути, чтобы собранный сайт открывался с GitHub Pages.
  base: './',
})
