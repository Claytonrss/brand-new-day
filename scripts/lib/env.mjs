import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `.env` (created by `scripts/setup.sh`) carries this checkout/worktree's
 * PORT so dev, Playwright and evidence scripts agree without anyone passing
 * flags around. Import for side effect BEFORE reading process.env.PORT.
 */
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../../.env');
if (existsSync(envPath) && !process.env.PORT) {
  process.loadEnvFile(envPath);
}

export const PORT = Number(process.env.PORT ?? 5173);
export const DEFAULT_BASE_URL = `http://127.0.0.1:${PORT}`;
