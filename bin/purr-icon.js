#!/usr/bin/env node
// Builds an app's icon in the family style from its glyph:
//   purr-icon <dagobert|legit|tulip|purr|path/to/glyph.svg> [--out src-tauri/icons]
//     [--tray] [--mark <colour>] [--favicon] [--no-icon]
// Writes icon.svg and source.png (1024, for `tauri icon`) unless `--no-icon`. `--tray` adds
// tray.svg and tray.png (a 128 menu-bar template), `--mark` adds mark.svg (the glyph alone in that
// colour) and `--favicon` favicon.svg (purple, white in a dark tab bar). Those three are cropped
// to the glyph itself, so they fill their space.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PURPLE, composeIcon, composeMark, composeTray, squareAround } from "../src/app-icon.js";

const args = process.argv.slice(2);
const VALUED = ["--out", "--mark"];
const option = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
const out = resolve(option("--out") ?? "src-tauri/icons");
const mark = option("--mark");
const source = args.find((a, i) => !a.startsWith("--") && !VALUED.includes(args[i - 1]));
if (!source) {
  console.error(
    "usage: purr-icon <name | glyph.svg> [--out dir] [--tray] [--mark <colour>] [--favicon] [--no-icon]",
  );
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

// An optional peer: apps only need it on the day they rebuild an icon, not on every install.
let Resvg;
try {
  ({ Resvg } = await import("@resvg/resvg-js"));
} catch {
  console.error(
    "purr-icon renders with @resvg/resvg-js, which isn't installed. Add it for now with\n" +
      "  npm i --no-save @resvg/resvg-js\n" +
      "(the next npm install takes it away again), then run purr-icon again.",
  );
  process.exit(1);
}
const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
const box = squareAround(new Resvg(composeMark(glyph)).getBBox());

mkdirSync(out, { recursive: true });
const written = [];
const write = (file, data) => {
  writeFileSync(join(out, file), data);
  written.push(file);
};
if (!args.includes("--no-icon")) {
  const icon = composeIcon(glyph);
  write("icon.svg", icon);
  write("source.png", png(icon, 1024));
}
if (args.includes("--tray")) {
  const tray = composeTray(glyph, box);
  write("tray.svg", tray);
  write("tray.png", png(tray, 128));
}
if (mark) write("mark.svg", composeMark(glyph, mark, { box }));
if (args.includes("--favicon"))
  write("favicon.svg", composeMark(glyph, PURPLE.mid, { box, dark: "#fff" }));

console.log(`purr-icon: wrote ${written.join(", ")} to ${out}`);
if (written.includes("source.png"))
  console.log(`next: npx tauri icon ${join(out, "source.png")} -o ${out}`);
