// Every icon `purr/icons` exports, by name, each loaded only when first drawn: Phosphor's ~1500
// would otherwise be most of the site.
import type { Component } from "svelte";

type Loader = () => Promise<{ default: Component<any> }>;

// `base` keeps the keys short: they are most of this chunk. The query keeps every weight: the
// purr plugin trims the plain module to the ones an app draws, as it does for the rest of the site.
const phosphor = import.meta.glob<{ default: Component<any> }>(
  ["./*.svelte", "!./*Icon.svelte", "!./IconContext.svelte"],
  { base: "../../../node_modules/phosphor-svelte/lib/", query: "?weights=all" },
);
const own = import.meta.glob<{ default: Component<any> }>("./*.svelte", {
  base: "../../../src/icons/",
});

export interface IconEntry {
  name: string;
  /** Hand-drawn in purr rather than Phosphor's. */
  own: boolean;
  /** The name's words, so "arrow down" finds `ArrowDown`. */
  words: string;
  load: Loader;
}

const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1, -".svelte".length);
const entry = (path: string, load: Loader, isOwn: boolean): IconEntry => {
  const name = nameOf(path);
  return { name, own: isOwn, words: name.replace(/([a-z0-9])([A-Z])/g, "$1 $2"), load };
};

export const ICONS: IconEntry[] = [
  ...Object.entries(own).map(([path, load]) => entry(path, load, true)),
  ...Object.entries(phosphor).map(([path, load]) => entry(path, load, false)),
].sort((a, b) => (a.name < b.name ? -1 : 1));

const loaded = new Map<string, Component<any>>();

/** The component if it is already here, for a first render without a flash. */
export const cached = (name: string) => loaded.get(name);

export async function load(icon: IconEntry): Promise<Component<any>> {
  const hit = loaded.get(icon.name);
  if (hit) return hit;
  const component = (await icon.load()).default;
  loaded.set(icon.name, component);
  return component;
}
