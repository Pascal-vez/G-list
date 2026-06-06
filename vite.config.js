import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qrcode from 'qrcode-terminal'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), qrcodePlugin()],
  server: {
    host: true,
  },
})
