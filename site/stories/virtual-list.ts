import { VirtualList } from "purr";
import VirtualListPreview from "../previews/VirtualListPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "VirtualList",
  group: "Lists",
  component: VirtualList,
  description:
    "Renders only the rows on screen. Heights are known up front — one number, or one per row — so nothing is ever measured and the scrollbar is honest. Give it a `key` when rows hold state; `scroller` windows against an ancestor that scrolls instead.",
  controls: {
    count: { type: "number", pseudo: true, value: 10000, min: 0, max: 1000000, step: 1000 },
    rowHeight: {
      type: "number",
      value: 26,
      min: 12,
      max: 80,
      note: "px, or a function of the row",
    },
    variable: { type: "boolean", pseudo: true, value: false, note: "Rows of 1–4 lines" },
    overscan: { type: "number", default: 6, min: 0, max: 50 },
    padding: { type: "text", optional: true, value: "" },
    label: {
      type: "text",
      optional: true,
      value: "Rows",
      note: "Names the list; rows become list items",
    },
    role: { type: "select", options: ["list", "listbox"], default: "list" },
  },
  code: (args) => `<script lang="ts">
  import { VirtualList } from "purr";

  const rows = Array.from({ length: ${args.count} }, (_, i) => ({ id: i, name: \`Row \${i + 1}\` }));
</script>

<div style="height: 280px; display: flex; flex-direction: column">
  <VirtualList
    items={rows}
    rowHeight={${args.variable ? "(row) => 12 + row.lines * 18" : args.rowHeight}}
    key={(row) => row.id}${args.overscan !== 6 ? `\n    overscan={${args.overscan}}` : ""}${args.label ? `\n    label=${JSON.stringify(args.label)}` : ""}${args.padding ? `\n    padding=${JSON.stringify(args.padding)}` : ""}
  >
    {#snippet children(row)}
      <div class="row-item">{row.name}</div>
    {/snippet}
  </VirtualList>
</div>`,
  preview: VirtualListPreview,
});
