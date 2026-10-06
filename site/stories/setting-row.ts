import { SettingRow } from "purr";
import SettingRowPreview from "../previews/SettingRowPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "SettingRow",
  group: "Layout",
  component: SettingRow,
  description:
    "One setting: a label, a line of explanation and the control, at the end or under it with `stack`.",
  controls: {
    label: { type: "text", value: "Notify me" },
    sub: { type: "text", optional: true, value: "For direct messages and mentions." },
    stack: { type: "boolean", default: false },
    disabled: { type: "boolean", default: false },
    control: {
      type: "select",
      pseudo: true,
      options: ["switch", "segmented", "select"],
      value: "switch",
    },
  },
  inner: (args) =>
    args.control === "segmented"
      ? `<Segmented label="Layout" bind:value={layout} options={layouts} />`
      : args.control === "select"
        ? `<select class="field-input">…</select>`
        : `<Switch label="Notify me" bind:checked={notify} />`,
  uses: ["Switch"],
  preview: SettingRowPreview,
});
