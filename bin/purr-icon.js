#!/usr/bin/env node
// Builds an app's icon in the family style from its glyph:
//   purr-icon <dagobert|legit|tulip|purr|path/to/glyph.svg> [--out src-tauri/icons]
// Writes icon.svg, tray.svg, source.png (1024, for `tauri icon`) and tray.png (a 128 template).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { composeIcon, composeTray } from "../src/app-icon.js";

const args = process.argv.slice(2);
const at = args.indexOf("--out");
const out = resolve(at >= 0 ? args[at + 1] : "src-tauri/icons");
const source = args.find((a, i) => !a.startsWith("--") && i !== at + 1);
if (!source) {
  console.error("usage: purr-icon <name | glyph.svg> [--out dir]");
  process.exit(1);
}

const family = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app-icons");
// A bare name is a family icon; anything that looks like a file is a glyph of the app's own.
const path = /[/\\]|\.svg$/.test(source) ? source : join(family, `${source}.svg`);
if (!existsSync(path)) {
  console.error(`purr-icon: no glyph at ${source}, and no family icon by that name`);
  process.exit(1);
}
const glyph = readFileSync(path, "utf8");
const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();

mkdirSync(out, { recursive: true });
const icon = composeIcon(glyph);
const tray = composeTray(glyph);
writeFileSync(join(out, "icon.svg"), icon);
writeFileSync(join(out, "tray.svg"), tray);
writeFileSync(join(out, "source.png"), png(icon, 1024));
writeFileSync(join(out, "tray.png"), png(tray, 128));
console.log(`purr-icon: wrote icon.svg, tray.svg, source.png and tray.png to ${out}`);
console.log(`next: npx tauri icon ${join(out, "source.png")} -o ${out}`);
