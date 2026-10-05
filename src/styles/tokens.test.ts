// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { AA_NON_TEXT, AA_TEXT, contrastRatio, parseColor } from "../lib/color";
import { ACCENTS, type ResolvedTheme } from "../lib/theme";

// Read rather than imported: Vite hands a stylesheet to a test as an empty module, and the
// point is to check the tokens that ship.
const css = readFileSync("src/styles/tokens.css", "utf8");

function tokens(selector: string): Record<string, string> {
  const block = new RegExp(`(?:^|\\n)${selector}\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`no ${selector} block in tokens.css`);
  const found: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    found[name] = value.trim();
  }
  return found;
}

const PALETTE: Record<ResolvedTheme, Record<string, string>> = {
  light: tokens(":root"),
  dark: tokens("html\\.dark"),
};

const THEMES: ResolvedTheme[] = ["light", "dark"];

/** The busiest surface text sits on: a hovered row, darkest in light and lightest in dark. */
const surface = (theme: ResolvedTheme) => PALETTE[theme]["--bg3"];

describe.each(THEMES)("the %s palette", (theme) => {
  const palette = PALETTE[theme];

  it.each(["--color", "--color2", "--muted", "--danger", "--success", "--warn", "--info"])(
    "reads %s as text against a hovered row",
    (token) => {
      expect(contrastRatio(palette[token], surface(theme))).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it("keeps the star mark visible", () => {
    expect(contrastRatio(palette["--star"], surface(theme))).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it("keeps presence dots apart from the panel behind them", () => {
    for (const token of ["--success", "--warn"]) {
      expect(contrastRatio(palette[token], palette["--bg2"])).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });

  it("carries readable text on a danger fill", () => {
    expect(contrastRatio(palette["--on-danger"], palette["--danger"])).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it("matches the default accent's pair", () => {
    expect([palette["--theme"], palette["--theme2"]]).toEqual(ACCENTS[0][theme]);
  });
});

// Every accent replaces `--theme` and `--theme2`, so the palette above only proves the default.
describe.each(ACCENTS)("the $label accent", (accent) => {
  it.each(THEMES)("reads as text on %s", (theme) => {
    expect(contrastRatio(accent[theme][1], surface(theme))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(THEMES)("carries text on a filled button on %s", (theme) => {
    expect(contrastRatio(PALETTE[theme]["--on-accent"], accent[theme][0])).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it.each(THEMES)("carries text on a hovered filled button on %s", (theme) => {
    expect(contrastRatio(PALETTE[theme]["--on-accent2"], accent[theme][1])).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  // Fills may be deep (a filled box is told by its tick); rings and bars are drawn in `--theme2`.
  it.each(THEMES)("shows a ring in the accent against the page on %s", (theme) => {
    expect(contrastRatio(accent[theme][1], PALETTE[theme]["--bg"])).toBeGreaterThanOrEqual(
      AA_NON_TEXT,
    );
  });
});

// What `.tag` and `.ink` compute: the picked colour with its OKLCH lightness clamped, drawn on
// that colour's own tint (at most 22%) over any surface.
type Rgb = [number, number, number];
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clip = (c: number) => Math.min(1, Math.max(0, c));

function clampLightness(rgb: Rgb, min: number, max: number): Rgb {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = Math.min(max, Math.max(min, 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s));
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const l3 = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m3 = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s3 = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ].map((c) => clip(toGamma(c))) as Rgb;
}

const hex = (rgb: Rgb) =>
  `#${rgb
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
const rgbOf = (colour: string) => parseColor(colour).map((c) => c / 255) as Rgb;

describe.each(THEMES)("text in any picked colour on %s", (theme) => {
  const palette = PALETTE[theme];
  const min = Number(palette["--ink-min"]);
  const max = Number(palette["--ink-max"]);
  const steps = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => i / 7);

  it("stays AA on its own tint over every surface", () => {
    let worst = Infinity;
    for (const r of steps)
      for (const g of steps)
        for (const b of steps) {
          const pick: Rgb = [r, g, b];
          const ink = hex(clampLightness(pick, min, max));
          for (const page of ["--bg", "--bg2", "--bg3"]) {
            const under = rgbOf(palette[page]);
            const tint = hex(under.map((c, i) => 0.22 * pick[i] + 0.78 * c) as Rgb);
            worst = Math.min(worst, contrastRatio(ink, tint));
          }
        }
    expect(worst).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("keeps a glyph in that colour 3:1 against every surface", () => {
    const markMin = Number(palette["--mark-min"]);
    const markMax = Number(palette["--mark-max"]);
    let worst = Infinity;
    for (const r of steps)
      for (const g of steps)
        for (const b of steps) {
          const mark = hex(clampLightness([r, g, b], markMin, markMax));
          for (const page of ["--bg", "--bg2", "--bg3", "--bg4"])
            worst = Math.min(worst, contrastRatio(mark, palette[page]));
        }
    expect(worst).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});
