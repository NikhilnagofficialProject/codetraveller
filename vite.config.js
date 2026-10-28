import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/codetraveller/',
  server: {
    host: true, // This allows access via local IP
    port: 5173,
    strictPort: true,
  }
})
