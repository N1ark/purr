import { SettingGroup } from "purr";
import SettingGroupPreview from "../previews/SettingGroupPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "SettingGroup",
  group: "Layout",
  component: SettingGroup,
  description: "A titled run of `SettingRow`s, with an optional description and note.",
  controls: {
    title: { type: "text", optional: true, value: "Notifications" },
    description: { type: "text", optional: true, value: "" },
    note: {
      type: "text",
      optional: true,
      value: "Desktop notifications also need the system's permission.",
    },
  },
  inner: () =>
    `<SettingRow label="Notify me" sub="For direct messages and mentions.">\n  <Switch label="Notify me" bind:checked={notify} />\n</SettingRow>\n<SettingRow label="Play a sound" disabled={!notify}>\n  <Switch label="Play a sound" bind:checked={sound} disabled={!notify} />\n</SettingRow>`,
  uses: ["SettingRow", "Switch"],
  preview: SettingGroupPreview,
});
