import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
      proxy: {
        '/api': 'http://localhost:8080',
        '/members/login': { target: 'http://localhost:5173', bypass: (req) => req.url },  // ← 프론트가 처리
        '/members': 'http://localhost:8080',
      }
    }
})
