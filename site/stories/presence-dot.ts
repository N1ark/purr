import { PresenceDot } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "PresenceDot",
  group: "Display",
  component: PresenceDot,
  description:
    "Green when active, amber when idle, nothing when offline. Set `--ring-bg` to the surface behind it.",
  controls: {
    state: { type: "select", options: ["active", "idle", "offline"], value: "active" },
    size: { type: "number", default: 7, min: 4, max: 24 },
    ring: { type: "boolean", default: true },
    label: {
      type: "text",
      optional: true,
      value: "Active",
      note: "Without one the dot is decoration",
    },
  },
  examples: [
    { title: "Idle", args: { state: "idle", label: "Idle" } },
    { title: "Large, no ring", args: { size: 14, ring: false } },
  ],
});
