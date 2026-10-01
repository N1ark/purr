import { ProgressRing } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ProgressRing",
  group: "Display",
  component: ProgressRing,
  description:
    "How far along: a ring that fills, e.g. a task list's done count. `max` of 0 draws an empty ring.",
  controls: {
    value: { type: "number", value: 3, min: 0 },
    max: { type: "number", value: 5, min: 0 },
    size: { type: "number", optional: true, value: 24, min: 8, max: 96, note: "Diameter in px" },
    label: { type: "text", optional: true, value: "3 of 5 done" },
  },
  examples: [
    { title: "Nothing tracked", args: { value: 0, max: 0, label: "Nothing tracked" } },
    { title: "Done", args: { value: 5, max: 5, label: "All done" } },
    { title: "Small", args: { value: 1, max: 4, size: 14 } },
  ],
});
