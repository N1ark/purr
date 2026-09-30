import type { IconWeight } from "phosphor-svelte";

/** Stroke width per weight on Phosphor's 256 grid, so hand-drawn icons match its line weights. */
export const STROKE: Record<IconWeight, number> = {
  thin: 8,
  light: 12,
  regular: 16,
  bold: 24,
  fill: 16,
  duotone: 16,
};

/** A full circle as path data, for shapes that combine with `fill-rule="evenodd"`. */
export function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
}
