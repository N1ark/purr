import { TextField } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "TextField",
  group: "Forms",
  component: TextField,
  description:
    "A labelled `.field-input` with a hint or an error under it. Any input attribute passes through.",
  width: "320px",
  controls: {
    value: { type: "text", value: "Atlas" },
    label: { type: "text", optional: true, value: "Name" },
    hint: { type: "text", optional: true, value: "What the window title shows." },
    error: { type: "text", optional: true, value: "", note: "Replaces the hint" },
    placeholder: { type: "text", optional: true, value: "" },
    type: {
      type: "select",
      options: ["text", "email", "password", "number", "search", "url"],
      default: "text",
    },
    disabled: { type: "boolean", default: false },
  },
  events: {
    oninput: {
      sync: (_, e: Event & { currentTarget: HTMLInputElement }) => ({
        value: e.currentTarget.value,
      }),
      bind: "value",
    },
    onchange: true,
  },
  examples: [
    {
      title: "Invalid",
      args: {
        label: "Email",
        type: "email",
        value: "not-an-email",
        hint: "",
        error: "That is not an email address.",
      },
    },
    {
      title: "Placeholder only",
      args: { label: "", hint: "", value: "", placeholder: "Search notes…" },
    },
  ],
});
