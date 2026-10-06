// The note menu the menu stories share, as the playground had it: icons, hints, a disabled entry
// with a note, checkable statuses and tags, a submenu, a colour grid and a two-press delete.
import type { Snippet } from "svelte";
import type { MaybeEntry, MenuControl } from "purr";
import { ArrowRight, ArrowSquareOut, Copy, FolderOpen, Trash } from "purr/icons";

export const STAGES = [
  { name: "Todo", color: "#61afef" },
  { name: "Doing", color: "#e5c07b" },
  { name: "Done", color: "#98c379" },
];
export const COLORS = [
  "#b045ab",
  "#c678dd",
  "#61afef",
  "#56b6c2",
  "#98c379",
  "#e5c07b",
  "#d19a66",
  "#e06c75",
];

export const note = $state({
  status: "Doing",
  tags: ["design"] as string[],
  all: ["design", "urgent", "later"],
  color: "#61afef",
});

/** The entries; `ran` hears every chosen item's label. */
export function noteMenu(
  ran: (label: string) => void,
  custom?: Snippet<[MenuControl]>,
): MaybeEntry[] {
  return [
    { label: "Open", run: () => ran("Open") },
    {
      label: "Open in new window",
      icon: ArrowSquareOut,
      hint: "⌘↩",
      run: () => ran("Open in new window"),
    },
    { label: "Copy", icon: Copy, hint: "⌘C", run: () => ran("Copy") },
    {
      label: "Reveal in Finder",
      icon: FolderOpen,
      disabled: true,
      note: "Only in the desktop app.",
    },
    "separator",
    { kind: "heading", label: "Status" },
    ...STAGES.map((s) => ({
      label: s.name,
      swatch: s.color,
      checked: note.status === s.name,
      run: () => {
        note.status = s.name;
        ran(`Status: ${s.name}`);
      },
    })),
    { kind: "heading", label: "Tags" },
    ...note.all.map((tag) => ({
      label: tag,
      checked: note.tags.includes(tag),
      keepOpen: true,
      run: () => {
        note.tags = note.tags.includes(tag)
          ? note.tags.filter((t) => t !== tag)
          : [...note.tags, tag];
        ran(`Tag: ${tag}`);
      },
    })),
    custom && { kind: "custom", render: custom },
    "separator",
    {
      label: "Move to",
      icon: ArrowRight,
      items: [
        { label: "Inbox", run: () => ran("Move to Inbox") },
        { label: "Archive", run: () => ran("Move to Archive") },
        "separator",
        {
          label: "Project",
          items: ["Atlas", "Beacon", "Comet"].map((p) => ({
            label: p,
            run: () => ran(`Move to ${p}`),
          })),
        },
      ],
    },
    { kind: "heading", label: "Colour" },
    {
      kind: "colors",
      colors: COLORS,
      selected: note.color,
      pick: (c) => {
        note.color = c;
        ran(`Colour ${c}`);
      },
      custom: (c) => (note.color = c),
      label: "Colour",
    },
    "separator",
    {
      label: "Delete",
      icon: Trash,
      danger: true,
      confirm: "Really delete?",
      run: () => ran("Delete"),
    },
  ];
}
