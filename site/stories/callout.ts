import { Callout } from "purr";
import CalloutPreview from "../previews/CalloutPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Callout",
  group: "Display",
  component: Callout,
  description:
    "An aside in running text: a note, a tip, a warning. `tone` (or any `color`) tints it, and a `title` sits on a stronger band of the same colour; an `icon` leads the `title`, or sits in the top corner when there is none. Inside `.md` it keeps the prose's rhythm; `--callout-tint` (the body), `--callout-head-tint` (the band, up to 22% keeps the title AA), `--callout-pad`, `--callout-border` and `--callout-shadow` tune it from outside.",
  controls: {
    tone: {
      type: "select",
      options: ["accent", "info", "success", "warn", "danger", "neutral"],
      default: "accent",
    },
    color: { type: "color", optional: true, value: "" },
    title: { type: "text", optional: true, value: "Note" },
    icon: { type: "icon", pseudo: true, value: "Note", note: "A snippet; any markup" },
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
