import { Badge } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Badge",
  group: "Display",
  component: Badge,
  description:
    "A count in a capsule, a circle at one digit. `accent` is unread, `danger` a direct mention or an error, `soft` a count that is not news. Rendered once per row, so it stays bare.",
  controls: {
    count: { type: "number", value: 3, min: 0 },
    tone: { type: "select", options: ["accent", "danger", "soft"], default: "accent" },
    partial: { type: "boolean", default: false, note: "A floor, not a total: adds the +" },
    max: { type: "number", default: 999, min: 1, note: "Counts above it read max+" },
  },
  examples: [
    { title: "Mention", args: { count: 42, tone: "danger" } },
    { title: "Soft", args: { count: 7, tone: "soft" } },
    { title: "Capped", args: { count: 1200 } },
    { title: "Partial", args: { count: 50, partial: true } },
  ],
});
