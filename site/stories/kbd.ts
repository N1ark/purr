import { Kbd } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Kbd",
  group: "Display",
  component: Kbd,
  description:
    "A shortcut hint as key caps: `⇧⌘K`, `j`, or a chord `g i`. `⌘` reads as Ctrl off a Mac.",
  controls: {
    hint: { type: "text", value: "⇧⌘K" },
    then: { type: "text", default: "then", note: "Between a chord's steps" },
  },
  examples: [
    { title: "A letter", args: { hint: "j" } },
    { title: "A chord", args: { hint: "g i" } },
    { title: "Option and an arrow", args: { hint: "⌥↓" } },
    { title: "Return", args: { hint: "⌘↩" } },
    { title: "Escape", args: { hint: "Esc" } },
  ],
});
