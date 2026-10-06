import { ActionSheet } from "purr";
import ActionSheetPreview from "../previews/ActionSheetPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ActionSheet",
  group: "Overlays & menus",
  component: ActionSheet,
  description:
    "A phone's menu that rises from the bottom edge; a flick of its grabber, a tap on the scrim or `dismiss()` closes it. `Menu` uses it on `body.mobile`.",
  controls: {
    label: { type: "text", value: "Message actions" },
    dismissLabel: { type: "text", default: "Dismiss", note: "The grabber's name" },
    role: { type: "select", options: ["menu", "dialog"], default: "menu" },
  },
  overlay: { close: "onclose", open: "Open the sheet" },
  events: { onclose: true, "item.run": true },
  inner: () =>
    `<button class="row-item" role="menuitem" onclick={reply}><ArrowBendUpLeft /> Reply</button>\n<button class="row-item" role="menuitem" onclick={copy}><Copy /> Copy text</button>`,
  usesIcons: ["ArrowBendUpLeft", "Copy"],
  preview: ActionSheetPreview,
});
