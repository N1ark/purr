import { Sheet } from "purr";
import SheetPreview from "../previews/SheetPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Sheet",
  group: "Overlays & menus",
  component: Sheet,
  description:
    "A phone's bottom sheet with two stops, peeking and full, dragged by its grabber or contents. A focused field opens it fully.",
  controls: {
    label: { type: "text", value: "A sheet" },
    full: { type: "boolean", default: false, note: "Open fully" },
    expandLabel: { type: "text", default: "Expand" },
    collapseLabel: { type: "text", default: "Collapse" },
  },
  overlay: { close: "onclose", open: "Open the sheet" },
  events: { onclose: true, onfull: { sync: (_, full: boolean) => ({ full }), bind: "full" } },
  inner: () => `<div class="sheet-body">…</div>`,
  preview: SheetPreview,
});
