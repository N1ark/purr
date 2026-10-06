import { PanelHeader } from "purr";
import PanelHeaderPreview from "../previews/PanelHeaderPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "PanelHeader",
  group: "Layout",
  component: PanelHeader,
  description:
    "A pane's first line: icon, title, count, then `children`, `actions` and a close button when `onclose` is set.",
  controls: {
    title: { type: "text", value: "Pull requests" },
    icon: { type: "icon", optional: true, value: "GitPullRequest" },
    count: { type: "number", optional: true, value: 12, min: 0 },
    level: { type: "select", options: [2, 3, 4], default: 2 },
    closeLabel: { type: "text", default: "Close" },
    actions: { type: "boolean", pseudo: true, value: true, note: "A refresh button" },
  },
  events: { onclose: { handler: "close", optional: true, on: true } },
  inner: (args) =>
    args.actions
      ? `{#snippet actions()}\n  <IconButton label="Refresh" onclick={refresh}><ArrowsClockwise /></IconButton>\n{/snippet}`
      : "",
  uses: ["IconButton"],
  usesIcons: ["ArrowsClockwise"],
  preview: PanelHeaderPreview,
});
