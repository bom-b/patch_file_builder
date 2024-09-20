import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    // alias: {
    //   '@': fileURLToPath(new URL('./src', import.meta.url))
    // }
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  base: './', //상대경로 설정
  build: {
    rollupOptions: {
      external: ['electron'] // Electron을 외부 모듈로 설정
    }
  },
})
