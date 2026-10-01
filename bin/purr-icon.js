#!/usr/bin/env node
// Builds an app's icon in the family style from its glyph:
//   purr-icon <dagobert|legit|tulip|purr|path/to/glyph.svg> [--out src-tauri/icons] [--tray] [--mark <colour>]
// Always writes icon.svg and source.png (1024, for `tauri icon`). `--tray` adds tray.svg and
// tray.png (a 128 menu-bar template); `--mark` adds mark.svg, the glyph alone in that colour.
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { composeIcon, composeMark, composeTray } from "../src/app-icon.js";

const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const out = resolve(option("--out") ?? "src-tauri/icons");
const mark = option("--mark");
const tray = args.includes("--tray");
const source = args.find(
  (a, i) => !a.startsWith("--") && !["--out", "--mark"].includes(args[i - 1]),
);
if (!source) {
  console.error("usage: purr-icon <name | glyph.svg> [--out dir] [--tray] [--mark <colour>]");
  process.exit(1);
}

// A bare name is a family icon; anything that looks like a file is a glyph of the app's own.
const family = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app-icons");
const path = /[/\\]|\.svg$/.test(source) ? source : join(family, `${source}.svg`);
if (!existsSync(path)) {
  console.error(`purr-icon: no glyph at ${source}, and no family icon by that name`);
  process.exit(1);
}
const glyph = readFileSync(path, "utf8");
const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();

mkdirSync(out, { recursive: true });
const written = ["icon.svg", "source.png"];
const icon = composeIcon(glyph);
writeFileSync(join(out, "icon.svg"), icon);
writeFileSync(join(out, "source.png"), png(icon, 1024));
if (tray) {
  const svg = composeTray(glyph);
  writeFileSync(join(out, "tray.svg"), svg);
  writeFileSync(join(out, "tray.png"), png(svg, 128));
  written.push("tray.svg", "tray.png");
}
if (mark) {
  writeFileSync(join(out, "mark.svg"), composeMark(glyph, mark));
  written.push("mark.svg");
}
console.log(`purr-icon: wrote ${written.join(", ")} to ${out}`);
console.log(`next: npx tauri icon ${join(out, "source.png")} -o ${out}`);
