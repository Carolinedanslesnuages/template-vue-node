import { resolve } from 'path'
import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import { VitePWA } from 'vite-plugin-pwa'
import manifest from './manifest.js'

const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1'
const SERVER_PORT = process.env.SERVER_PORT || 4000

// https://vitejs.dev/config/
export default defineConfig(mode => ({
  server: {
    host: mode === 'production' ? '127.0.0.1' : '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: `http://${SERVER_HOST}:${SERVER_PORT}`,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    vue(),
    WindiCSS(),
    svgLoader(),
    VitePWA({
      includeAssets: ['/img/logo.svg', 'favicon.ico', 'robots.txt', '/favicons/android-chrome-192x192.png', '/favicons/android-chrome-512x512.png'],
      base: '/',
      srcDir: 'src',
      manifest,
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    watch: false,
  },
}))
