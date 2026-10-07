import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/chemsolve-ai/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
