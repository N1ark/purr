/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";

// The playground renders every component against the library's own source.
export default defineConfig({
  root: "playground",
  plugins: [svelte()],
  resolve: { alias: { purr: fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 1430 },
  build: { outDir: "../dist-playground", emptyOutDir: true },
  test: { root: ".", environment: "jsdom", include: ["src/**/*.test.ts"] },
});
