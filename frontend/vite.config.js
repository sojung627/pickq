import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
      proxy: {
        '/api': 'http://localhost:8080', // 난 api로 시작하는 컨트롤러가 없을텐데....
        '/members/login': { target: 'http://localhost:5173', bypass: (req) => req.url },  // ← 프론트가 처리
        '/members': 'http://localhost:8080',
         '/mypage': 'http://localhost:8080',
         '/uploads': 'http://localhost:8080'
      }
    }
})
