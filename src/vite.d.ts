// Types for `vite.js`, which stays plain JavaScript so Node can load it from `node_modules`.

export interface PurrOptions {
  /**
   * Phosphor weights the app uses; the others are cut from every icon before it compiles. A bare
   * `purr/glyphs` name (`Star`) carries these too.
   */
  weights?: string[];
}

/**
 * What `purr()` returns, typed by shape rather than as Vite's `Plugin`: purr's own copy of Vite
 * (and of Rollup under it) need not be the app's, and their `Plugin` types do not unify.
 */
export interface PurrPlugin {
  name: string;
  enforce?: "pre" | "post";
  [hook: string]: unknown;
}

export const DEFAULT_WEIGHTS: string[];

/** Wires purr into an app: `plugins: [purr(), svelte()]`. */
export function purr(options?: PurrOptions): PurrPlugin[];
export default purr;

export function customIcons(indexSource: string, dir: string): Map<string, string>;
export function rewriteIconImports(
  code: string,
  lookup: (name: string) => string | null,
): string | null;
export function iconDepsIn(code: string, lookup: (name: string) => string | null): string[];
export function trimWeights(code: string, weights: readonly string[]): string;

/** Every weight, with the suffix that names a glyph of that weight alone (`StarFill`). */
export const GLYPH_WEIGHTS: Record<string, string>;
export function parseGlyph(
  name: string,
  exists: (icon: string) => boolean,
): { icon: string; weight: string | null } | null;
export function glyphFromMarkup(markup: string): string;
export function phosphorGlyph(source: string, weight: string): string | null;
export function phosphorIcons(lib: string): string[];
export function rewriteGlyphImports(code: string, has: (name: string) => boolean): string | null;
export function glyphModule(weights: Record<string, string>, factory: string): string;
export function glyphSvelte(weights: Record<string, string>): string | null;
export function glyphDeclarations(icons: readonly string[]): string;
