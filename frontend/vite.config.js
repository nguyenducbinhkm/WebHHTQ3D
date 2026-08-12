import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Ép Vite liên tục quét file thay vì chờ OS báo
      interval: 100,     // Quét mỗi 100ms
    },
    hmr: {
      overlay: true,     // Bật thông báo lỗi trực tiếp trên màn hình web nếu code sai
    },
  },
})