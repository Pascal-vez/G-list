import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function getNetworkIp() {
  const nets = os.networkInterfaces()
  for (const ifaces of Object.values(nets)) {
    for (const net of ifaces ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return null
}

function qrcodePlugin() {
  return {
    name: 'dev-qrcode',
    configureServer(server) {
      server.httpServer?.once('listening', async () => {
        const addr = server.httpServer?.address()
        const port = typeof addr === 'object' && addr ? addr.port : 5173
        const ip = getNetworkIp()
        if (!ip) return
        const url = `http://${ip}:${port}`
        console.log('\n  📱 Téléphone (même Wi-Fi) — scannez le QR code :\n')
        try {
          const qrcode = await import('qrcode-terminal')
          qrcode.default.generate(url, { small: true })
        } catch { /* qrcode-terminal absent — affichage texte seulement */ }
        console.log(`  ${url}\n`)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    qrcodePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/logo.svg', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'G-List — Annuaire professionnel Guinée',
        short_name: 'G-List',
        description: 'Trouvez les meilleurs professionnels de Guinée',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#F8F6F0',
        theme_color: '#F5C518',
        lang: 'fr-GN',
        categories: ['business', 'lifestyle'],
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/images/logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
})
