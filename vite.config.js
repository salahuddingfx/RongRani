import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast') || id.includes('react-icons')) {
              return 'ui';
            }
            if (id.includes('axios') || id.includes('react-helmet-async') || id.includes('i18next')) {
              return 'utils';
            }
            return 'vendor'; // Fallback for other node_modules
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
