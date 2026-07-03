import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // 💡 ĐỔI THÀNH TRUE/FALSE TẠI ĐÂY
  // true  -> Gọi API tới localhost:5000 (Backend ở máy bạn)
  // false -> Gọi API tới link Railway (Backend trên mạng)
  const useLocalBackend = false;

  return {
    plugins: [react()],
    
    // Gắn cứng URL Production vào biến môi trường tại đây
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        useLocalBackend 
          ? '/api' // Dùng proxy /api khi ở localhost
          : 'https://cinemamanagement-production-f12a.up.railway.app/api' 
      )
    },

    // Cấu hình Proxy dành riêng cho localhost
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
});
