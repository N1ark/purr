import { CommandPalette } from "purr";
import CommandPalettePreview from "../previews/CommandPalettePreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "CommandPalette",
  group: "Overlays & menus",
  component: CommandPalette,
  description:
    "A field over a fuzzy-ranked list, walked with the arrows and picked with ↩ (⌘↩ passes the modifier on). `create` offers a new item after the matches.",
  keywords: ["quick switcher", "search", "omnibox", "cmd k"],
  controls: {
    source: {
      type: "select",
      pseudo: true,
      options: ["notes (5,000)", "commands"],
      value: "notes (5,000)",
    },
    placeholder: { type: "text", default: "Type to search…", value: "Jump to a note…" },
    label: { type: "text", default: "Command palette", value: "Jump to a note" },
    create: {
      type: "boolean",
      pseudo: true,
      value: true,
      note: 'Offer "Create …" after the matches',
    },
    limit: { type: "number", default: 200, min: 1 },
    chooseLabel: { type: "text", default: "open" },
    navigateLabel: { type: "text", default: "navigate" },
    rowHeight: { type: "number", optional: true, value: undefined, min: 20, max: 60 },
    width: { type: "text", optional: true, value: "" },
    offset: { type: "text", default: "12vh" },
    scrim: { type: "select", options: ["normal", "strong", "frosted", "none"], default: "normal" },
  },
  overlay: { close: "onclose", open: "Open the palette" },
  events: {
    onclose: true,
    onchoose: { handler: "open", optional: true, on: true },
    "item.run": true,
  },
  propsCode: (args) => ({
    items: args.source === "commands" ? "commands" : "notes",
    ...(args.create ? { create: '(query) => ({ id: "new", label: `Create “${query}”` })' } : {}),
  }),
  preview: CommandPalettePreview,
});
