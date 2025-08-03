import { fileURLToPath } from "node:url";
import { preact } from "@preact/preset-vite";
const babelCwd = new URL("../", import.meta.url);
function getRenderer(development) {
  return {
    name: "@astrojs/preact",
    clientEntrypoint: development ? "@astrojs/preact/client-dev.js" : "@astrojs/preact/client.js",
    serverEntrypoint: "@astrojs/preact/server.js"
  };
}
function getContainerRenderer() {
  return {
    name: "@astrojs/preact",
    serverEntrypoint: "@astrojs/preact/server.js"
  };
}
function src_default({ include, exclude, compat, devtools } = {}) {
  return {
    name: "@astrojs/preact",
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig, command, injectScript }) => {
        const preactPlugin = preact({
          reactAliasesEnabled: compat ?? false,
          include,
          exclude,
          babel: {
            cwd: fileURLToPath(babelCwd)
          }
        });
        const viteConfig = {
          optimizeDeps: {
            include: ["@astrojs/preact/client.js", "preact", "preact/jsx-runtime"],
            exclude: ["@astrojs/preact/server.js"]
          }
        };
        if (compat) {
          viteConfig.optimizeDeps.include.push(
            "preact/compat",
            "preact/test-utils",
            "preact/compat/jsx-runtime"
          );
          viteConfig.resolve = {
            dedupe: ["preact/compat", "preact"]
          };
          viteConfig.ssr = {
            noExternal: ["react", "react-dom", "react-dom/test-utils", "react/jsx-runtime"]
          };
        }
        viteConfig.plugins = [preactPlugin];
        addRenderer(getRenderer(command === "dev"));
        updateConfig({
          vite: viteConfig
        });
        if (command === "dev" && devtools) {
          injectScript("page", 'import "preact/debug";');
        }
      }
    }
  };
}
export {
  src_default as default,
  getContainerRenderer
};
