import { ResizeEdge } from "purr";
import ResizeEdgePreview from "../previews/ResizeEdgePreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ResizeEdge",
  group: "Layout",
  component: ResizeEdge,
  description:
    "A pane's draggable edge, also moved with the arrows; double-click or Enter returns to `preset`. `oncommit` fires when a drag settles.",
  controls: {
    side: {
      type: "select",
      options: ["left", "right", "top", "bottom"],
      value: "left",
      note: "The pane's side",
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
