import { Lightbox } from "purr";
import { MEDIA } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Lightbox",
  group: "Overlays & menus",
  component: Lightbox,
  description:
    "Pictures, videos and sounds full-size over a dimmed app: ← and → step through them, Escape or a click beside the picture closes it. `actions` adds buttons beside the counter; `media` replaces how an item is drawn.",
  controls: {
    index: { type: "number", default: 0, min: 0, max: MEDIA.length - 1 },
    label: { type: "text", default: "Media viewer" },
    closeLabel: { type: "text", default: "Close" },
    previousLabel: { type: "text", default: "Previous" },
    nextLabel: { type: "text", default: "Next" },
  },
  props: { items: MEDIA },
  propsCode: { items: "items" },
  overlay: { close: "onclose", open: "Open the lightbox" },
  events: { onclose: true },
});
