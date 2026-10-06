import { TextArea } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "TextArea",
  group: "Forms",
  component: TextArea,
  description: "A labelled multi-line `.field-input`, resizable vertically; `mono` for code.",
  width: "380px",
  controls: {
    value: { type: "text", multiline: true, value: "Fix the thing\n\nIt was broken." },
    label: { type: "text", optional: true, value: "Commit message" },
    hint: { type: "text", optional: true, value: "" },
    error: { type: "text", optional: true, value: "" },
    mono: { type: "boolean", default: false, value: true },
    rows: { type: "number", default: 4, min: 1, max: 20 },
    placeholder: { type: "text", optional: true, value: "" },
    disabled: { type: "boolean", default: false },
  },
  events: {
    oninput: {
      sync: (_, e: Event & { currentTarget: HTMLTextAreaElement }) => ({
        value: e.currentTarget.value,
      }),
      bind: "value",
    },
  },
  examples: [
    {
      title: "Prose, with a hint",
      args: {
        mono: false,
        label: "Description",
        value: "",
        placeholder: "What changed, and why",
        hint: "Markdown is fine.",
      },
    },
  ],
});
