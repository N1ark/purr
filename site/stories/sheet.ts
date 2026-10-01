import { Sheet } from "purr";
import SheetPreview from "../previews/SheetPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Sheet",
  group: "Overlays & menus",
  component: Sheet,
  description:
    "The one panel a phone shows at a time: a bottom sheet with two stops, peeking and full, dragged by its grabber or its contents, flung to the next stop or off the bottom. A field taking focus opens it fully. Moved by a transform, so the drag stays on the compositor.",
  controls: {
    label: { type: "text", value: "A sheet" },
    full: { type: "boolean", default: false, note: "At the top stop rather than peeking" },
    expandLabel: { type: "text", default: "Expand" },
    collapseLabel: { type: "text", default: "Collapse" },
  },
  overlay: { close: "onclose", open: "Open the sheet" },
  events: { onclose: true, onfull: { sync: (_, full: boolean) => ({ full }), bind: "full" } },
  inner: () => `<div class="sheet-body">…</div>`,
  preview: SheetPreview,
});
