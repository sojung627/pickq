/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./main.html",                // 작성하신 main.html이 루트에 있다면 추가
    "./src/**/*.{js,ts,jsx,tsx}", // src 폴더 내부의 모든 파일 감시
    "./path/to/templates/**/*.html" // 만약 HTML 파일들이 특정 폴더(예: templates)에 모여있다면 그 경로도 추가
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}