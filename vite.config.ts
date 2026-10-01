/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import { purr } from "./src/vite";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const src = (path: string) => here(`./src/${path}`);

// The catalog site renders every component against the library's own source, through the same
// plugin the apps use; the aliases stand in for the package's `exports`. `BASE=/purr/` builds it
// for GitHub Pages.
export default defineConfig({
  root: "site",
  base: process.env.BASE ?? "/",
  plugins: [purr(), svelte({ configFile: here("./svelte.config.js") })],
  resolve: {
    alias: [
      { find: /^purr\/styles\.css$/, replacement: src("styles/index.css") },
      { find: /^purr\/fonts\.css$/, replacement: src("styles/fonts.css") },
      { find: /^purr\/shell\.css$/, replacement: src("styles/shell.css") },
      { find: /^purr$/, replacement: src("index.ts") },
      { find: /^purr\/(.*)$/, replacement: src("$1") },
    ],
  },
  server: { port: 1430 },
  preview: { port: 1431 },
  build: { outDir: "../dist-site", emptyOutDir: true },
  test: { root: ".", environment: "jsdom", include: ["src/**/*.test.ts", "site/**/*.test.ts"] },
});
