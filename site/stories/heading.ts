import { Heading } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Heading",
  group: "Display",
  component: Heading,
  description:
    "A heading that links to itself, with a `#` in the margin on hover. Without an `id` it names itself from its text.",
  controls: {
    level: { type: "select", options: [1, 2, 3, 4, 5, 6], value: 2, required: true },
    text: { type: "text", pseudo: true, value: "Where it all started" },
    id: { type: "text", optional: true, value: "" },
  },
  children: { text: "text" },
  width: "360px",
  keywords: ["anchor", "permalink", "slug"],
});
