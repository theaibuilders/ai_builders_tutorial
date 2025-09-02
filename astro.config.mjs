import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

export default defineConfig({
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
  }
});
