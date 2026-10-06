import { Tag } from "purr";
import TagDemo from "../demos/TagDemo.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Tag",
  group: "Display",
  component: Tag,
  description:
    "A small capsule label, tinted by any colour. `onclick` makes it a button, `onremove` adds a remove button.",
  controls: {
    label: { type: "text", value: "design" },
    color: { type: "color", optional: true, value: "#61afef" },
    caps: { type: "boolean", default: false },
    title: { type: "text", optional: true, value: "", note: "Hover text" },
    removeLabel: { type: "text", default: "Remove" },
  },
  events: {
    onclick: { handler: "filterByTag", optional: true },
    onremove: { handler: "removeTag", optional: true, on: true },
  },
  examples: [
    { title: "Neutral", args: { color: "", label: "neutral", onremove: false } },
    { title: "Caps", args: { color: "", label: "bot", caps: true, onremove: false } },
    {
      title: "Accent",
      args: { color: "var(--theme2)", label: "you", caps: true, onremove: false },
    },
    {
      title: "Clickable",
      args: { color: "#98c379", label: "later", onclick: true, onremove: false },
    },
  ],
  demo: TagDemo,
});
