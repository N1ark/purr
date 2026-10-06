import { Callout } from "purr";
import CalloutPreview from "../previews/CalloutPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Callout",
  group: "Display",
  component: Callout,
  description:
    "An aside in running text, tinted by `tone` or any `color`. The `--callout-*` properties tune it; keep `--callout-head-tint` at 22% or less so the title stays readable.",
  controls: {
    tone: {
      type: "select",
      options: ["accent", "info", "success", "warn", "danger", "neutral"],
      default: "accent",
    },
    color: { type: "color", optional: true, value: "" },
    title: { type: "text", optional: true, value: "Note" },
    icon: { type: "icon", pseudo: true, value: "Note", note: "A snippet" },
    text: {
      type: "text",
      pseudo: true,
      multiline: true,
      value: "Callouts hold **anything** the prose does: paragraphs, lists, code.",
    },
  },
  inner: (args) =>
    `${args.icon ? `{#snippet icon()}<${args.icon} />{/snippet}\n` : ""}<p>${String(args.text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`,
  examples: [
    { title: "Corner icon", args: { title: "", icon: "Heart", tone: "accent" } },
    { title: "Warning", args: { title: "Careful", icon: "Warning", tone: "warn" } },
    { title: "Plain", args: { title: "", icon: "", tone: "neutral" } },
  ],
  preview: CalloutPreview,
  keywords: ["admonition", "note", "aside", "tip", "warning"],
});
