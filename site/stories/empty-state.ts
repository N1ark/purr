import { EmptyState } from "purr";
import EmptyStateDemo from "../demos/EmptyStateDemo.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "EmptyState",
  group: "Display",
  component: EmptyState,
  description:
    "What an empty list or a failed search says: an icon, a line, a hint, and optionally a way out (`action`). `inline` for a short line inside a list.",
  controls: {
    text: { type: "text", optional: true, value: "Nothing matches" },
    hint: { type: "text", optional: true, value: "Try a shorter filter." },
    icon: { type: "icon", optional: true, value: "MagnifyingGlass" },
    inline: { type: "boolean", default: false },
  },
  examples: [
    { title: "Inline", args: { inline: true, icon: undefined, text: "No topics yet", hint: "" } },
  ],
  demo: EmptyStateDemo,
});
