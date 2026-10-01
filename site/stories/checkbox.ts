import { Checkbox } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Checkbox",
  group: "Controls",
  component: Checkbox,
  description:
    "A native checkbox drawn as `.checkbox`, with an optional label, a hint under it and an indeterminate state. Other input attributes pass through.",
  controls: {
    checked: { type: "boolean", value: true },
    indeterminate: { type: "boolean", default: false, note: "Mixed: some of a selection" },
    label: { type: "text", value: "Show whitespace", optional: true },
    hint: { type: "text", optional: true, value: "" },
    disabled: { type: "boolean", default: false },
  },
  events: {
    onchange: {
      sync: (_, e: Event & { currentTarget: HTMLInputElement }) => ({
        checked: e.currentTarget.checked,
        indeterminate: false,
      }),
      bind: "checked",
    },
  },
  examples: [
    {
      title: "With a hint",
      args: { checked: false, label: "Wrap lines", hint: "Long lines wrap at the window's edge." },
    },
    { title: "Mixed", args: { indeterminate: true, label: "Select all" } },
    { title: "Disabled", args: { disabled: true, label: "Locked" } },
  ],
});
