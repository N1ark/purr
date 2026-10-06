import { TableOfContents } from "purr";
import TableOfContentsDemo from "../demos/TableOfContentsDemo.svelte";
import { defineStory } from "../lib/story";

const ITEMS = [
  { id: "intro", title: "Introduction", level: 2 },
  { id: "setup", title: "Setting up", level: 2 },
  { id: "install", title: "Installing", level: 3 },
  { id: "config", title: "Configuring", level: 3 },
  { id: "flags", title: "Flags", level: 4 },
  { id: "usage", title: "Using it", level: 2 },
];

export default defineStory({
  title: "TableOfContents",
  group: "Layout",
  component: TableOfContents,
  description:
    "A document's headings as a nested rail of links. `headingsIn(root)` reads them off rendered HTML; `onselect` when something other than the window scrolls.",
  controls: {
    title: { type: "text", optional: true, value: "Contents" },
    label: { type: "text", default: "Table of contents" },
    current: {
      type: "select",
      options: ["", ...ITEMS.map((i) => i.id)],
      default: "",
      note: "The section being read",
    },
  },
  props: { items: ITEMS },
  propsCode: { items: "items" },
  events: { onselect: { handler: "jump", optional: true } },
  width: "260px",
  demo: TableOfContentsDemo,
  keywords: ["toc", "headings", "outline", "headingsIn", "slugify", "anchors"],
});
