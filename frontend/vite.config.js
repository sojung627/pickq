import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiProxy = {
  target: 'http://localhost:8080',
  changeOrigin: true,
  bypass(req) {
    // 새로고침/직접 진입(문서 요청)이면 프록시 안 타고 index.html로 (Vite가 SPA로 처리)
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return '/index.html';
    }
    // 그 외(fetch/axios 등 API 호출)는 그대로 백엔드로 프록시
  }
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { global: "globalThis" },
  server: {
    proxy: {
      '/api': apiProxy,
      '/members': apiProxy,
      '/mypage': apiProxy,
      '/uploads': apiProxy,
      '/chatRoom': apiProxy,
      '/chats': apiProxy,
      '/auth': apiProxy,
      '/ws-chat': { target: 'http://localhost:8080', ws: true }, // 웹소켓은 그대로 유지
    }
  }
})