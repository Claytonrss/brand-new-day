import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// .env (created by scripts/setup.sh) carries this checkout/worktree's PORT.
if (existsSync(new URL('.env', import.meta.url))) {
  process.loadEnvFile(new URL('.env', import.meta.url));
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    // Per-worktree port (docs/agents/test-isolation.md §10): PORT=5200 pnpm dev
    port: Number(process.env.PORT ?? 5173),
  },
});
