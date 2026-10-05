/**
 * WCAG contrast, so a palette is checked by a test rather than by eye, and the deterministic
 * colours avatars and tags derive from a name.
 */

/** Minimum for body text. */
export const AA_TEXT = 4.5;
/** Minimum for icons, rules and other marks that carry meaning without text. */
export const AA_NON_TEXT = 3;

export type Rgb = [number, number, number];

/**
 * Reads `#rgb`, `#rrggbb`, `#rrggbbaa`, `hsl()` and `oklch()` (alpha ignored, out-of-gamut
 * clipped); throws on anything else.
 */
export function parseColor(colour: string): Rgb {
  const text = colour.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
  if (hex) {
    const short = hex[1].length === 3;
    return [0, 1, 2].map((i) =>
      parseInt(short ? hex[1][i].repeat(2) : hex[1].slice(i * 2, i * 2 + 2), 16),
    ) as Rgb;
  }
  const hsl = /^hsl\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*\)$/i.exec(text);
  if (hsl) return fromHsl(Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100);
  const oklch =
    /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i.exec(text);
  if (oklch) {
    const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1);
    return fromOklch(lightness, Number(oklch[3]), Number(oklch[4]));
  }
  throw new Error(`not a colour this understands: ${colour}`);
}

function fromHsl(hue: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h = ((hue % 360) + 360) % 360;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255)) as Rgb;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function fromOklch(lightness: number, chroma: number, hue: number): Rgb {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255)) as Rgb;
}

/** `[lightness 0–1, chroma, hue in degrees]`; a grey's hue is 0. */
export function toOklch(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bb);
  const hue = chroma < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return [lightness, chroma, hue];
}

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(colour: string): number {
  const [r, g, b] = parseColor(colour).map((v) => toLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Between 1 (identical) and 21 (black on white); the order does not matter. */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

/** Black or white, whichever reads better on `background` (a tag chip in a user's colour). */
export function readableOn(background: string, dark = "#111", light = "#fff"): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light;
}

/** A stable number for a string, for anything that needs a colour from a name. */
export function hashString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** The golden angle keeps neighbouring seeds off neighbouring hues. */
const GOLDEN_ANGLE = 137.508;

/**
 * A deterministic colour for a number (a user id, or `hashString(email)`), as `oklch()`: one
 * lightness for every hue, so no avatar reads heavier than its neighbour. The defaults keep white
 * initials at AA on every hue and stay inside sRGB, which `color.test.ts` checks.
 */
export function colorFromSeed(seed: number, chroma = 0.08, lightness = 0.5): string {
  const hue = Math.round((seed * GOLDEN_ANGLE) % 360);
  return `oklch(${lightness} ${chroma} ${hue})`;
}

/** One or two letters for an avatar: the first and last word's, or a lone word's first two. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = [...parts[0]];
  if (parts.length === 1) return first.slice(0, 2).join("").toUpperCase();
  return (first[0] + [...parts[parts.length - 1]][0]).toUpperCase();
}
