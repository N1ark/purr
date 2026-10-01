import { Spinner } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Spinner",
  group: "Display",
  component: Spinner,
  description:
    "Something is being waited for. `1em` sits in a line of text or a button; the label is announced, never drawn.",
  controls: {
    size: {
      type: "select",
      options: [
        { label: "1em", value: "1em" },
        { label: "16", value: 16, code: "16" },
        { label: "24", value: 24, code: "24" },
        { label: "40", value: 40, code: "40" },
      ],
      default: "1em",
      value: "24",
    },
    label: { type: "text", default: "Loading", value: "Syncing" },
  },
  examples: [
    { title: "In text", args: { size: "1em" } },
    { title: "Large", args: { size: "40" } },
  ],
});
