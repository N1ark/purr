/**
 * WCAG contrast, so a palette is checked by a test rather than by eye, and the deterministic
 * colours avatars and tags derive from a name.
 */

/** Minimum for body text. */
export const AA_TEXT = 4.5;
/** Minimum for icons, rules and other marks that carry meaning without text. */
export const AA_NON_TEXT = 3;

export type Rgb = [number, number, number];

/** Reads `#rgb`, `#rrggbb`, `#rrggbbaa` (alpha ignored) and `hsl()`; throws on anything else. */
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

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(colour: string): number {
  const [r, g, b] = parseColor(colour).map((v) => {
    const channel = v / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
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
 * A deterministic colour for a number (a user id, or `hashString(email)`). The default lightness
 * keeps white initials at AA on every hue, which `color.test.ts` checks.
 */
export function colorFromSeed(seed: number, saturation = 42, lightness = 33): string {
  const hue = Math.round((seed * GOLDEN_ANGLE) % 360);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

/** One or two letters for an avatar: the first and last word's, or a lone word's first two. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = [...parts[0]];
  if (parts.length === 1) return first.slice(0, 2).join("").toUpperCase();
  return (first[0] + [...parts[parts.length - 1]][0]).toUpperCase();
}
