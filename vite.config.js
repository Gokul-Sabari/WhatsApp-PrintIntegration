import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: '192.168.1.91', // Specify your IP address
  //   port: 6009,
  //   strictPort: true,
  //   open: true
  // }
})