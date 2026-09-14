import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// .env (created by scripts/setup.sh) carries this checkout/worktree's PORT.
if (existsSync(new URL('.env', import.meta.url))) {
  process.loadEnvFile(new URL('.env', import.meta.url));
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // vendor-3d concentra three + r3f (~1,2 MB min). Dividi-lo mais exigiria
    // React.lazy no canvas, rejeitado porque o loader narrativo consome o
    // useProgress do GLB que só existe dentro do canvas — limite explícito
    // em vez de warning recorrente sobre decisão tomada (A6 na auditoria).
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        // Vendor splitting (A6 na auditoria): three/@react-three dominam o
        // bundle e mudam raramente — chunk próprio maximiza cache entre
        // visitas; gsap/lenis idem para o motion. React fica no entry (muda
        // junto com o app).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            /[\\/]node_modules[\\/](three|three-stdlib|@react-three|postprocessing)[\\/]/.test(id)
          ) {
            return 'vendor-3d';
          }
          if (/[\\/]node_modules[\\/](gsap|lenis)[\\/]/.test(id)) {
            return 'vendor-motion';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    // Per-worktree port (docs/agents/test-isolation.md §10): PORT=5200 pnpm dev
    port: Number(process.env.PORT ?? 5173),
  },
});
