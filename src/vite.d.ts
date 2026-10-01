// Types for `vite.js`, which stays plain JavaScript so Node can load it from `node_modules`.

export interface PurrOptions {
  /** Phosphor weights the app uses; the others are cut from every icon before it compiles. */
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
