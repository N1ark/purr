// Rewrites the glyph files purr keeps in the repo, after Phosphor or one of purr's own icons
// changes: `npm run glyphs`. `src/glyphs.test.ts` fails until it has run.
//   src/glyphs.d.ts       every glyph's name, for type checking
//   src/icons/glyphs.json purr's own icons at each weight, rendered once here (Phosphor's are read
//                         from its source as an app builds)
//   src/icons/ui.ts       the glyphs purr's components draw, inlined so they need no plugin
import { readFileSync, writeFileSync } from "node:fs";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { format } from "prettier";
import { createServer } from "vite";
import {
  GLYPH_WEIGHTS,
  customIcons,
  glyphDeclarations,
  glyphFromMarkup,
  parseGlyph,
  phosphorGlyph,
  phosphorIcons,
} from "../src/vite.js";

const root = new URL("..", import.meta.url).pathname;
const lib = `${root}node_modules/phosphor-svelte/lib`;
const icons = `${root}src/icons`;
const own = [...customIcons(readFileSync(`${icons}/index.ts`, "utf8"), icons)].filter(
  ([name]) => !name.endsWith("Icon"),
);

const server = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true, entries: [] },
  plugins: [svelte({ preprocess: vitePreprocess() })],
});
const { render } = await server.ssrLoadModule("svelte/server");
/** @type {Record<string, Record<string, string>>} */
const ownGlyphs = {};
for (const [name, file] of own.sort(([a], [b]) => (a < b ? -1 : 1))) {
  const Icon = (await server.ssrLoadModule(file)).default;
  ownGlyphs[name] = {};
  for (const weight of Object.keys(GLYPH_WEIGHTS)) {
    const html = render(Icon, { props: { weight } }).body.replace(/<!--[\s\S]*?-->/g, "");
    const inner = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(html)?.[1];
    if (inner === undefined) throw new Error(`${name} rendered no <svg>`);
    ownGlyphs[name][weight] = glyphFromMarkup(inner);
  }
}
await server.close();

const write = async (path, text, parser) =>
  writeFileSync(path, parser ? await format(text, { parser, printWidth: 100 }) : text);

await write(`${icons}/glyphs.json`, JSON.stringify(ownGlyphs), "json");
const names = [...Object.keys(ownGlyphs), ...phosphorIcons(lib)].sort();
await write(`${root}src/glyphs.d.ts`, glyphDeclarations(names));

const ui = readFileSync(`${icons}/ui.ts`, "utf8");
const exists = (icon) => Object.hasOwn(ownGlyphs, icon) || names.includes(icon);
const entries = [...ui.matchAll(/^export const (\w+)/gm)].map(([, name]) => {
  const glyph = parseGlyph(name, exists);
  if (!glyph?.weight) throw new Error(`ui.ts: ${name} is no glyph of one weight`);
  if (ownGlyphs[glyph.icon]) throw new Error(`ui.ts: ${name} is several shapes, not one path`);
  const data =
    ownGlyphs[glyph.icon]?.[glyph.weight] ??
    phosphorGlyph(readFileSync(`${lib}/${glyph.icon}.svelte`, "utf8"), glyph.weight);
  return `export const ${name} = /* @__PURE__ */ pathGlyph(${JSON.stringify({ [glyph.weight]: data })});`;
});
await write(
  `${icons}/ui.ts`,
  `${ui.slice(0, ui.search(/^export const /m))}${entries.join("\n")}\n`,
  "typescript",
);
console.log(`glyphs: ${names.length} icons, ${own.length} of them purr's own`);
