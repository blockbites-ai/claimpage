import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['0xsequence', '@0xsequence/kit', 'ethers']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
