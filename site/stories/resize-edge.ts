import { ResizeEdge } from "purr";
import ResizeEdgePreview from "../previews/ResizeEdgePreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ResizeEdge",
  group: "Layout",
  component: ResizeEdge,
  description:
    "The draggable edge of a pane: drag it, or focus it and use the arrows (Shift for bigger steps); double-click or Enter returns to `preset`. `oncommit` fires when a drag settles, for saving.",
  controls: {
    side: {
      type: "select",
      options: ["left", "right", "top", "bottom"],
      value: "left",
      note: "Which side the pane is on; the edge is opposite",
    },
    label: { type: "text", value: "Resize the sidebar" },
    min: { type: "number", optional: true, value: 120, min: 0 },
    max: { type: "number", optional: true, value: 360, min: 0 },
    preset: { type: "number", optional: true, value: 200, min: 0 },
  },
  events: {
    onresize: { handler: "(px) => (width = px)" },
    oncommit: { handler: "save" },
  },
  propsCode: { size: "width" },
  preview: ResizeEdgePreview,
});
