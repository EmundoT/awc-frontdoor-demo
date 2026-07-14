import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A small experiment.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
})
