import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import qrcode from 'qrcode-terminal';
import os from 'node:os';

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
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address()
        const port = typeof addr === 'object' && addr ? addr.port : 5173
        const ip = getNetworkIp()
        if (!ip) return

        const url = `http://${ip}:${port}`
        console.log('\n  📱 Téléphone (même Wi-Fi) — scannez le QR code :\n')
        qrcode.generate(url, { small: true })
        console.log(`  ${url}\n`)
      })
    },
  }
}

function sitemapPlugin() {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    async closeBundle() {
      const { genererSitemap } = await import('./src/utils/generateSitemap.js');
      const xml = genererSitemap();
      const out = join(dirname(fileURLToPath(import.meta.url)), 'public', 'sitemap.xml');
      writeFileSync(out, xml, 'utf8');
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), qrcodePlugin(), sitemapPlugin()],
  server: {
    host: true,
  },
})
