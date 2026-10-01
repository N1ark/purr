import { Twisty } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Twisty",
  group: "Display",
  component: Twisty,
  description:
    "A disclosure chevron: right when closed, down when open. It turns without changing its box.",
  controls: {
    open: { type: "boolean", value: false, required: true },
    size: { type: "number", default: 12, min: 8, max: 40 },
  },
  examples: [
    { title: "Open", args: { open: true } },
    { title: "Large", args: { size: 24 } },
  ],
});
