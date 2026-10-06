import { Footnote } from "purr";
import FootnoteDemo from "../demos/FootnoteDemo.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Footnote",
  group: "Display",
  component: Footnote,
  description:
    "A footnote with a link back to its `FootnoteRef` mark. They pair by `id`; `prefix` keeps two documents on one page apart.",
  controls: {
    id: { type: "text", value: "1", required: true },
    backLabel: { type: "text", default: "Back to the text" },
    prefix: { type: "text", default: "fn" },
    text: { type: "text", pseudo: true, value: "The text of the note." },
  },
  children: { text: "text", tag: "p" },
  width: "360px",
  demo: FootnoteDemo,
  keywords: ["FootnoteRef", "note", "citation", "reference"],
});
