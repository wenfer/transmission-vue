import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // 代理 Transmission RPC 请求
      '/transmission': {
        target: 'http://10.229.160.54:9091',
        changeOrigin: true,
      },
    },
  },
})
