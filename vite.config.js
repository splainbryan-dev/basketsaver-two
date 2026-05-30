import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/kroger-api': {
        target: 'https://api.kroger.com/v1',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/kroger-api/, ''),
      },
      '/kroger-auth': {
        target: 'https://api.kroger.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/kroger-auth/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
