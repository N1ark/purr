import { Masonry } from "purr";
import MasonryPreview from "../previews/MasonryPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Masonry",
  group: "Lists",
  component: Masonry,
  description:
    "Items of different heights in columns that end level, each placed in the shortest column so reading order stays close. Columns are added as `minWidth` fits.",
  controls: {
    count: { type: "number", pseudo: true, value: 14, min: 0, max: 60 },
    minWidth: { type: "number", default: 160, min: 60, max: 400, step: 10 },
    columns: { type: "number", optional: true, min: 1, max: 8, note: "Fixed instead" },
    gap: { type: "text", default: "var(--sp-4)" },
  },
  code: (args) => `<Masonry items={pictures} ratio={(p) => p.height / p.width}${
    args.minWidth !== 160 && args.minWidth !== undefined ? ` minWidth={${args.minWidth}}` : ""
  }${args.columns ? ` columns={${args.columns}}` : ""}>
  {#snippet item(picture)}
    <img src={picture.src} alt={picture.alt} style:aspect-ratio="{picture.width} / {picture.height}" />
  {/snippet}
</Masonry>`,
  width: "100%",
  preview: MasonryPreview,
  keywords: ["grid", "gallery", "pinterest", "columns", "packColumns"],
});
