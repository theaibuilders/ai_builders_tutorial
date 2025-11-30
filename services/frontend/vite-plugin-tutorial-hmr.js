import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin to enable HMR for tutorial files in the tutorials directory
 */
export default function tutorialHmrPlugin() {
  const tutorialsDir = path.join(__dirname, 'tutorials');

  return {
    name: 'tutorial-hmr',

    configureServer(server) {
      // Watch the tutorials directory for changes
      const watcher = fs.watch(tutorialsDir, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.md') || filename.endsWith('.mdx') || filename.endsWith('.ipynb'))) {
          console.log(`Tutorial file changed: ${filename}`);

          // Send HMR update to all clients
          server.ws.send({
            type: 'custom',
            event: 'tutorial-update',
            data: {
              file: filename,
              timestamp: Date.now()
            }
          });
        }
      });

      // Cleanup watcher on server close
      server.httpServer?.on('close', () => {
        watcher.close();
      });
    },

    // Handle HMR updates
    handleHotUpdate({ file, server }) {
      if (file.includes('/tutorials/') && (file.endsWith('.md') || file.endsWith('.mdx') || file.endsWith('.ipynb'))) {
        console.log(`HMR: Tutorial file updated - ${path.basename(file)}`);

        // Send custom event to clients
        server.ws.send({
          type: 'custom',
          event: 'tutorial-update',
          data: {
            file: path.relative(process.cwd(), file),
            timestamp: Date.now()
          }
        });

        // Return empty array to prevent default Vite HMR
        return [];
      }
    }
  };
}
