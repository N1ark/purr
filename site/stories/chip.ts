import { Chip } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Chip",
  group: "Controls",
  component: Chip,
  description:
    'A capsule toggle for filters ("Unread", "Archived"), styled by `.pill`; `on` is stated as `aria-pressed`.',
  controls: {
    label: { type: "text", value: "Unread" },
    on: { type: "boolean", default: false, value: true },
    disabled: { type: "boolean", default: false },
  },
  events: { onclick: { sync: (args) => ({ on: !args.on }), handler: "toggle" } },
  examples: [
    { title: "Off", args: { on: false, label: "Archived" } },
    { title: "On", args: { on: true, label: "Mentions" } },
  ],
});
