import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          // framer-motion is deliberately NOT pinned to its own chunk: only the
          // lazy-loaded home-page sections use it, so letting Vite attach it to
          // those section chunks keeps it off the product/contact/FAQ pages.
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5054',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
