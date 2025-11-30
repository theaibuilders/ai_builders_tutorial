import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Set environment variables for Astro's Node adapter
process.env.PORT = PORT;
process.env.HOST = HOST;

console.log(`Starting server on ${HOST}:${PORT}`);

// Import and start the Astro server
await import('./dist/server/entry.mjs');
