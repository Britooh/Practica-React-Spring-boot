import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

// Si el backend (puerto 3001) está apagado al correr "npm run dev", lo inicia automáticamente
function autoStartBackend() {
  let backendProc = null;
  return {
    name: 'auto-start-backend',
    configureServer() {
      const socket = net.createConnection({ port: 3001, host: '127.0.0.1' });
      socket.on('connect', () => socket.end());
      socket.on('error', () => {
        const backendScript = path.resolve(import.meta.dirname, '../backend/src/index.js');
        backendProc = spawn(process.execPath, [backendScript], { stdio: 'inherit' });
      });
      process.on('exit', () => backendProc?.kill());
    },
  };
}

export default defineConfig({
  plugins: [react(), autoStartBackend()],
  server: {
    host: true,   // expone el servidor en la red local (0.0.0.0)
    allowedHosts: true,
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
});
