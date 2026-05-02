import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
      proxy: {
        '/mypage': 'http://localhost:8080',
        '/members': 'http://localhost:8080',
      }
    }
})
