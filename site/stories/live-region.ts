import { LiveRegion } from "purr";
import LiveRegionPreview from "../previews/LiveRegionPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "LiveRegion",
  group: "Display",
  component: LiveRegion,
  description:
    "Says something to a screen reader without showing it. Pass a rising `seq` so the same text said twice is still announced.",
  controls: {
    text: { type: "text", value: "3 results" },
    assertive: { type: "boolean", default: false },
  },
  propsCode: { seq: "seq" },
  preview: LiveRegionPreview,
});
