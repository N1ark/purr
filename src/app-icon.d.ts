// Types for `app-icon.js`, plain JavaScript so the `purr-icon` CLI can run it from `node_modules`.

export interface IconColors {
  from: string;
  mid: string;
  to: string;
}

export interface IconOptions {
  colors?: IconColors;
  title?: string;
}

/** The marks a glyph is drawn with, as CSS declarations: `line`, `thin`, `fill`, `faint`, `cut`. */
export const GLYPH_CLASSES: Record<"line" | "thin" | "fill" | "faint" | "cut", string>;
export const TILE: { canvas: number; inset: number; size: number; radius: number };
export const PURPLE: IconColors;

/** The full icon: tile, light and the glyph (SVG markup in the 1024 space) on the grid. */
export function composeIcon(glyph: string, options?: IconOptions): string;
export interface MarkBox {
  x: number;
  y: number;
  size: number;
}

/** A square crop around a glyph's bounds (resvg's `getBBox`), with a margin of the longer side. */
export function squareAround(
  bounds: { x: number; y: number; width: number; height: number },
  margin?: number,
): MarkBox;
/**
 * The glyph alone in one colour (white by default), cut-outs as holes; cropped to the tile unless
 * `box` is given, and `dark` used instead under a dark colour scheme.
 */
export function composeMark(
  glyph: string,
  color?: string,
  options?: { box?: MarkBox; dark?: string },
): string;
/** The menu-bar template: the glyph alone in black, cut-outs as holes. */
export function composeTray(glyph: string, box?: MarkBox): string;
