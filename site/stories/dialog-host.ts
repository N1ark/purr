import { DialogHost } from "purr";
import DialogHostPreview from "../previews/DialogHostPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "DialogHost",
  group: "Overlays & menus",
  component: DialogHost,
  description:
    "Mount once; it renders what `await dialog.ask(spec)`, `confirmAction` and `promptText` ask: a title, a description, a few fields, and two buttons. The promise resolves to the values, or null when cancelled. Enter confirms from anywhere but a textarea.",
  keywords: ["dialog", "confirm", "prompt", "ask", "alert"],
  controls: {
    title: { type: "text", pseudo: true, value: "Rename topic" },
    description: {
      type: "text",
      pseudo: true,
      optional: true,
      value: "Everyone in the channel sees the new name.",
    },
    fields: {
      type: "select",
      pseudo: true,
      options: ["none", "one line", "a form"],
      value: "one line",
    },
    confirmLabel: { type: "text", pseudo: true, value: "Rename" },
    cancelLabel: { type: "text", pseudo: true, optional: true, value: "" },
    danger: { type: "boolean", pseudo: true, value: false },
  },
  events: { resolved: true },
  code: (args) => {
    const fields =
      args.fields === "one line"
        ? `\n  fields: [{ name: "name", label: "New name", value: "Menus", required: true }],`
        : args.fields === "a form"
          ? `\n  fields: [\n    { name: "name", label: "Name", required: true },\n    { name: "kind", label: "Kind", type: "select", options: [...] },\n    { name: "notes", label: "Notes", type: "textarea" },\n    { name: "private", label: "Private", type: "checkbox" },\n  ],`
          : "";
    const lines = [
      `  title: ${JSON.stringify(args.title)},`,
      args.description ? `  description: ${JSON.stringify(args.description)},` : "",
      fields.slice(1),
      args.confirmLabel ? `  confirmLabel: ${JSON.stringify(args.confirmLabel)},` : "",
      args.cancelLabel ? `  cancelLabel: ${JSON.stringify(args.cancelLabel)},` : "",
      args.danger ? "  danger: true," : "",
    ].filter(Boolean);
    return `<script lang="ts">
  import { DialogHost, dialog } from "purr";

  async function ask() {
    const values = await dialog.ask({
${lines.map((l) => `    ${l}`).join("\n")}
    });
    if (values) …; // null when cancelled
  }
</script>

<!-- once, at the root -->
<DialogHost />`;
  },
  preview: DialogHostPreview,
});
