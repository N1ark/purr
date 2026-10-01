import { Highlight, fuzzyMatch } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Highlight",
  group: "Display",
  component: Highlight,
  description:
    "Text with the characters a fuzzy match hit marked, from `fuzzyMatch(query, text).indices` or a `rank` result.",
  controls: {
    text: { type: "text", value: "QuickSwitcher.svelte" },
    query: { type: "text", pseudo: true, value: "qsw", note: "Matched with fuzzyMatch" },
  },
  props: (args) => ({
    indices: fuzzyMatch(String(args.query ?? ""), String(args.text ?? ""))?.indices ?? [],
  }),
  propsCode: { indices: "fuzzyMatch(query, text)?.indices ?? []" },
  examples: [
    { title: "Word starts", args: { text: "Design the Schema", query: "dsch" } },
    { title: "No match", args: { text: "git dialog", query: "xyz" } },
  ],
});
