/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";
import { purr } from "./src/vite";

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

// The playground renders every component against the library's own source, through the same
// plugin the apps use; the aliases stand in for the package's `exports`.
export default defineConfig({
  root: "playground",
  plugins: [purr(), svelte()],
  resolve: {
    alias: [
      { find: /^purr\/styles\.css$/, replacement: src("styles/index.css") },
      { find: /^purr\/fonts\.css$/, replacement: src("styles/fonts.css") },
      { find: /^purr$/, replacement: src("index.ts") },
      { find: /^purr\/(.*)$/, replacement: src("$1") },
    ],
  },
  server: { port: 1430 },
  build: { outDir: "../dist-playground", emptyOutDir: true },
  test: { root: ".", environment: "jsdom", include: ["src/**/*.test.ts"] },
});
