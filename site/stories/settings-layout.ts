import { SettingsLayout } from "purr";
import SettingsLayoutPreview from "../previews/SettingsLayoutPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "SettingsLayout",
  group: "Layout",
  component: SettingsLayout,
  description:
    "A settings window: sections down the side in groups, the current one in a pane. On a phone the nav sits on top.",
  controls: {
    current: { type: "select", options: ["appearance", "git", "shortcuts"], value: "appearance" },
    label: { type: "text", default: "Settings" },
    level: { type: "select", options: [2, 3, 4], default: 3 },
    navWidth: { type: "text", default: "160px" },
  },
  events: {
    onselect: { sync: (_, current: string) => ({ current }), bind: "current" },
  },
  propsCode: { groups: "groups" },
  inner: () =>
    `{#snippet header()}\n  <PanelHeader title={current} />\n{/snippet}\n<p>The current section's content.</p>`,
  uses: ["PanelHeader"],
  preview: SettingsLayoutPreview,
});
