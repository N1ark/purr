// Every page of the site: the component stories (`stories/*.ts`) and the hand-written pages, all
// in the main bundle but Icons. Fetching a page on the way to it made navigation hang whenever
// the host stalled a request mid-session, and together they are smaller than Icons alone.
import type { Component } from "svelte";
import { slugOf, type Story } from "./lib/story";

export const GROUPS = [
  "Foundations",
  "Controls",
  "Forms",
  "Display",
  "Layout",
  "Overlays & menus",
  "Lists",
  "Actions",
  "Utilities",
] as const;

export type PageGroup = (typeof GROUPS)[number];

export interface Page {
  slug: string;
  title: string;
  group: PageGroup;
  description: string;
  keywords?: readonly string[];
  story?: Story;
  /** A page in the main bundle. */
  component?: Component;
  /** A page fetched when visited: only Icons, which carries every icon's name. */
  load?: () => Promise<{ default: Component }>;
}

const eager = import.meta.glob<{ default: Component }>(
  ["./pages/*.svelte", "!./pages/Icons.svelte"],
  {
    eager: true,
  },
);
const lazy = import.meta.glob<{ default: Component }>("./pages/Icons.svelte");

const page = (file: string): Pick<Page, "component" | "load"> => {
  const path = `./pages/${file}.svelte`;
  if (eager[path]) return { component: eager[path].default };
  if (lazy[path]) return { load: lazy[path] };
  throw new Error(`no page ${file}`);
};

const WRITTEN: Page[] = [
  {
    slug: "tokens",
    title: "Tokens",
    group: "Foundations",
    description: "Every custom property in tokens.css: colours, spacing, type, layers.",
    keywords: ["colors", "css variables", "custom properties", "palette"],
    ...page("Tokens"),
  },
  {
    slug: "typography",
    title: "Typography",
    group: "Foundations",
    description: "The type scale, the two families and the text utilities.",
    keywords: ["font", "text", "type scale"],
    ...page("Typography"),
  },
  {
    slug: "classes",
    title: "Classes",
    group: "Foundations",
    description: "The global classes: .btn, .row-item, .field-input, .checkbox, .tag, .pill…",
    keywords: ["btn", "row-item", "pill", "swatch", "surface", "field-input", "focus-frame"],
    ...page("Classes"),
  },
  {
    slug: "markdown",
    title: "Markdown & code",
    group: "Foundations",
    description: "Rendered markdown in .md, and the four highlighter markups code.css colours.",
    keywords: ["md", "prose", "highlight.js", "prism", "pygments", "syntax"],
    ...page("Markdown"),
  },
  {
    slug: "icons",
    title: "Icons",
    group: "Foundations",
    description: "All of Phosphor plus purr's own icons, searchable, in every weight.",
    keywords: ["phosphor", "svg", "glyph"],
    ...page("Icons"),
  },
  {
    slug: "tooltip",
    title: "tooltip",
    group: "Actions",
    description: "use:tooltip — an instant tooltip with an optional shortcut hint.",
    ...page("Tooltip"),
  },
  {
    slug: "drag-list",
    title: "dragList",
    group: "Actions",
    description: "use:dragList — drag to reorder, or to drop onto a target.",
    keywords: ["reorder", "dnd", "drag and drop", "dropIndex"],
    ...page("DragList"),
  },
  {
    slug: "focus",
    title: "focusTrap & autofocus",
    group: "Actions",
    description: "Keep Tab inside a region, focus a field on mount, give focus back.",
    keywords: ["focusTrap", "autofocus", "rememberFocus", "focusables", "a11y"],
    ...page("Focus"),
  },
  {
    slug: "resizer",
    title: "resizer",
    group: "Actions",
    description: "use:resizer — a drag handle that resizes a pane, with keys and a preset.",
    keywords: ["resize", "pane", "split", "draggedSize"],
    ...page("Resizer"),
  },
  {
    slug: "shortcuts",
    title: "Shortcuts",
    group: "Utilities",
    description: "formatShortcut and matches: one hint string for display and matching.",
    keywords: ["keys", "keyboard", "formatShortcut", "matches", "parseShortcut", "hotkey"],
    ...page("Shortcuts"),
  },
  {
    slug: "keymap",
    title: "createKeymap",
    group: "Utilities",
    description: "A table of bindings that handles keys, chords and the help overlay.",
    keywords: ["keys", "keyboard", "bindings", "chord", "helpGroups", "resolveKey"],
    ...page("Keymap"),
  },
  {
    slug: "fuzzy",
    title: "Fuzzy matching",
    group: "Utilities",
    description: "fuzzyMatch and rank: tiered matching with highlight indices.",
    keywords: ["fuzzyMatch", "rank", "search", "filter", "matchTier", "highlightRuns"],
    ...page("Fuzzy"),
  },
  {
    slug: "time",
    title: "Time",
    group: "Utilities",
    description: "formatRelative, formatDay, formatClock and friends, in the user's locale.",
    keywords: ["date", "formatRelative", "formatAbsolute", "formatDay", "clock"],
    ...page("Time"),
  },
  {
    slug: "theme",
    title: "Theme & platform",
    group: "Utilities",
    description: "applyTheme, the accents, densities, and what the platform helpers detect.",
    keywords: ["applyTheme", "dark", "accent", "density", "applyPlatform", "os", "mobile"],
    ...page("Theme"),
  },
  {
    slug: "toast",
    title: "toast",
    group: "Utilities",
    description: "toast(), toast.success(), toast.error(): brief notices for ToastHost.",
    keywords: ["notification", "snackbar"],
    ...page("Toast"),
  },
  {
    slug: "dialogs",
    title: "confirmAction & promptText",
    group: "Utilities",
    description: "Awaitable dialogs: a yes/no question, a line of text, a small form.",
    keywords: ["dialog", "confirm", "prompt", "ask"],
    ...page("Dialogs"),
  },
  {
    slug: "persisted",
    title: "persisted",
    group: "Utilities",
    description: "A rune that survives a reload, and the storage helpers under it.",
    keywords: ["localStorage", "storage", "persistedFlag", "readJson", "writeJson"],
    ...page("Persisted"),
  },
  {
    slug: "color",
    title: "Colour",
    group: "Utilities",
    description: "contrastRatio, readableOn, colorFromSeed, initials and parseColor.",
    keywords: ["contrast", "wcag", "color", "seed", "hash", "luminance"],
    ...page("Color"),
  },
  {
    slug: "updates",
    title: "createUpdater",
    group: "Utilities",
    description: "The update cycle as runes: check, download, restart, with release notes.",
    keywords: ["updater", "noteSummary", "dueForCheck", "release notes"],
    ...page("Updates"),
  },
  {
    slug: "misc",
    title: "Clipboard & lists",
    group: "Utilities",
    description: "copyText, moveItem, clamp, topK, lruCache and errorMessage.",
    keywords: ["copyText", "moveItem", "clamp", "topK", "lruCache", "errorMessage", "util"],
    ...page("Misc"),
  },
];

const modules = import.meta.glob<{ default: Story }>("./stories/*.ts", { eager: true });

const STORIES: Page[] = Object.values(modules).map(({ default: story }) => ({
  slug: story.slug ?? slugOf(story.title),
  title: story.title,
  group: story.group,
  description: story.description,
  keywords: story.keywords,
  story,
}));

// Written pages keep their order; stories go alphabetically within their group.
export const PAGES: Page[] = GROUPS.flatMap((group) => [
  ...WRITTEN.filter((p) => p.group === group),
  ...STORIES.filter((p) => p.group === group).sort((a, b) => a.title.localeCompare(b.title)),
]);

export const pageBySlug = (slug: string): Page | undefined => PAGES.find((p) => p.slug === slug);
