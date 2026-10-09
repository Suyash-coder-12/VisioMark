import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/known_faces': 'http://localhost:5000',
      '/unknown_faces': 'http://localhost:5000',
      '/scan': 'http://localhost:5000'
    }
  }
})
