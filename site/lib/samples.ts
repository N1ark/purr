// Sample data the stories share: people, pictures, palettes, menus.
import { helpGroups, type Binding, type LightboxItem, type PaletteItem } from "purr";
import { Gear, GitBranch, Keyboard, Note, Plus } from "purr/icons";

/** Dagobert's tag palette. */
export const TAGS = ["#b045ab", "#c678dd", "#61afef", "#56b6c2", "#98c379", "#e5c07b", "#d19a66"];
/** A slice of Tulip's channel colours. */
export const CHANNELS = [
  "#76ce90",
  "#fae589",
  "#a6c7e5",
  "#e79ab5",
  "#bfd56f",
  "#f4ae55",
  "#b0a5fd",
];

const svg = (body: string, box = "0 0 40 40") =>
  "data:image/svg+xml," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${body}</svg>`);

export const PICTURE = svg(
  `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4ae55"/><stop offset="1" stop-color="#a138bd"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="20" cy="16" r="7" fill="#fff" opacity=".85"/><rect x="9" y="26" width="22" height="14" rx="7" fill="#fff" opacity=".85"/>`,
);

export const PEOPLE = [
  { name: "Ada Lovelace", seed: 1 },
  { name: "Grace Hopper", seed: 2, src: PICTURE },
  { name: "Linus", seed: 3 },
  { name: "Margaret Hamilton", seed: 4 },
  { name: "Edsger Dijkstra", seed: 5 },
  { name: "Barbara Liskov", seed: 6 },
  { name: "Alan Kay", seed: 7 },
];

const picture = (a: string, b: string, label: string) =>
  svg(
    `<defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><text x="400" y="270" font-family="sans-serif" font-size="48" fill="#fff" text-anchor="middle">${label}</text>`,
    "0 0 800 500",
  );

export const MEDIA: LightboxItem[] = [
  {
    src: picture("#f4ae55", "#a138bd", "One"),
    alt: "An orange-to-purple gradient",
    detail: "800 × 500",
  },
  {
    src: picture("#56b6c2", "#27508f", "Two"),
    alt: "A teal-to-blue gradient",
    detail: "800 × 500",
  },
  { src: picture("#98c379", "#2f6b38", "Three"), caption: "Green", detail: "800 × 500" },
];

const WORDS = [
  "design",
  "schema",
  "render",
  "sheet",
  "menu",
  "palette",
  "tooltip",
  "graph",
  "sync",
  "merge",
];

/** Five thousand notes, for the palette and the lists. */
export const NOTES: PaletteItem[] = Array.from({ length: 5000 }, (_, i) => ({
  id: `n${i}`,
  label: `${WORDS[i % 10]} ${WORDS[(i * 7) % 10]} ${i}`,
  detail: i % 3 ? `#${WORDS[(i * 3) % 10]}` : undefined,
  icon: Note,
}));

export const COMMANDS: PaletteItem[] = [
  { id: "new", label: "New note", icon: Plus, hint: "⌘N" },
  { id: "settings", label: "Settings", icon: Gear, hint: "⌘," },
  { id: "help", label: "Keyboard shortcuts", icon: Keyboard, hint: "?" },
  { id: "branch", label: "Switch branch", icon: GitBranch, keywords: ["git", "checkout"] },
  { id: "theme", label: "Toggle dark theme", keywords: ["appearance"] },
];

export const BINDINGS: Binding[] = [
  { keys: "⌘K", action: "notes", label: "Jump to a note", group: "General" },
  { keys: "⇧⌘K", action: "commands", label: "Run a command", group: "General" },
  { keys: "?", action: "help", label: "Show this list", group: "General" },
  { keys: "j", action: "down", label: "Next item", group: "Lists" },
  { keys: "↓", action: "down", label: "Next item", group: "Lists" },
  { keys: "k", action: "up", label: "Previous item", group: "Lists" },
  { keys: "g i", action: "inbox", label: "Go to the inbox", group: "Lists" },
  { keys: "⌥↓", action: "unread", label: "Next unread", group: "Lists" },
];

export const HELP = helpGroups(BINDINGS, {
  extra: [{ label: "Close what's open", hints: ["Esc"], group: "General" }],
});
