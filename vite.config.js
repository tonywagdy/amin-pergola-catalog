import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/amin-pergola-catalog/' : './',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
