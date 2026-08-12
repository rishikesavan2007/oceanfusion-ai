import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Force single React instance to prevent "Invalid hook call" errors
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
    // Add this section only
  server: {
    allowedHosts: [
      'cycle-retrain-thousand.ngrok-free.dev',
    ],
  },
})

