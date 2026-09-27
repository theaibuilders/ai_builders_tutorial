import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel/serverless';
import { existsSync, readdirSync } from 'node:fs';
import tutorialHmrPlugin from './vite-plugin-tutorial-hmr.js';

// Vercel sets VERCEL=1 during its builds; use the Vercel adapter there so the
// on-demand rendered routes deploy as Vercel functions. Local dev and
// Zeabur/Docker builds keep the standalone Node adapter.
const isVercelBuild = process.env.VERCEL === '1';

// The tutorials page is rendered on demand and reads these files from disk at
// request time (path.join(process.cwd(), 'tutorials')), so they must be
// explicitly bundled into the Vercel serverless function.
function collectRuntimeDataFiles() {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(`${dir}/${entry.name}`);
      } else {
        files.push(`${dir}/${entry.name}`);
      }
    }
  };
  for (const dir of ['tutorials', 'tutorials-ja', 'tutorials-zh-cn', 'tutorials-draft']) {
    if (existsSync(dir)) walk(dir);
  }
  for (const file of ['tutorial-metadata.json', 'author-metadata.json']) {
    if (existsSync(file)) files.push(file);
  }
  return files;
}

export default defineConfig({
  output: 'hybrid', // Enable hybrid rendering mode
  adapter: isVercelBuild
    ? vercel({
        includeFiles: collectRuntimeDataFiles()
      })
    : node({
        mode: 'standalone'
      }),
  integrations: [
    tailwind(),
    preact({ compat: true })
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
      // Explicitly add languages we need highlighted in tutorials
      // (Shiki has many built-ins but we ensure yaml & dockerfile are loaded)
      langs: [
        'bash',
        'json',
        'python',
        'yaml',
        'dockerfile',
        'html',
        'xml'
      ]
    }
  },
  // Watch external directories for changes
  vite: {
    plugins: [tutorialHmrPlugin()],
    server: {
      watch: {
        ignored: ['!**/tutorials/**']
      }
    }
  }
});
