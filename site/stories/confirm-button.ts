import { ConfirmButton } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ConfirmButton",
  group: "Controls",
  component: ConfirmButton,
  description:
    "A destructive action that takes two presses: the first arms it and relabels it, the second runs `onconfirm`. It disarms itself after `timeout`.",
  controls: {
    children: { type: "text", value: "Delete" },
    icon: { type: "icon", optional: true, value: "Trash" },
    confirmLabel: { type: "text", value: "Click to confirm" },
    variant: { type: "select", options: ["danger", "default", "ghost", "link"], default: "danger" },
    size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
    timeout: {
      type: "number",
      default: 4000,
      min: 500,
      step: 500,
      note: "Milliseconds before it disarms",
    },
    disabled: { type: "boolean", default: false },
  },
  children: { text: "children", icon: "icon" },
  events: { onconfirm: "remove" },
  examples: [
    {
      title: "Force push",
      args: {
        variant: "default",
        icon: undefined,
        children: "Force push",
        confirmLabel: "Force push?",
      },
    },
    {
      title: "Inline, as a link",
      args: {
        variant: "link",
        icon: undefined,
        children: "Undo (keep changes)",
        confirmLabel: "Really undo?",
      },
    },
  ],
});
