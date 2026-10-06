import { Field } from "purr";
import FieldPreview from "../previews/FieldPreview.svelte";
import { element, imports } from "../lib/code";
import { defineStory } from "../lib/story";

const CONTROLS: Record<string, string> = {
  input: `<input class="field-input" placeholder="Pick a name" />`,
  select: `<select class="field-input">\n  <option>Everyone</option>\n  <option>Only me</option>\n</select>`,
  checkbox: `<input type="checkbox" class="checkbox" />`,
};

export default defineStory({
  title: "Field",
  group: "Forms",
  component: Field,
  description:
    "Labels any control, with a hint or an error under it. `TextField` and `TextArea` are built on it; use it directly for a `<select>` or your own control.",
  controls: {
    label: { type: "text", optional: true, value: "Visibility" },
    hint: { type: "text", optional: true, value: "Who can see this note." },
    error: { type: "text", optional: true, value: "" },
    inline: { type: "boolean", default: false },
    control: {
      type: "select",
      pseudo: true,
      options: ["select", "input", "checkbox"],
      value: "select",
    },
  },
  preview: FieldPreview,
  code: (args) => {
    const attrs = [
      args.label ? `label="${args.label}"` : "",
      args.hint ? `hint="${args.hint}"` : "",
      args.error ? `error="${args.error}"` : "",
      args.inline ? "inline" : "",
    ].filter(Boolean);
    return `${imports(["Field"])}\n\n${element("Field", attrs, CONTROLS[String(args.control)])}`;
  },
});
