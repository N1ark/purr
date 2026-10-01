import { ContextMenuHost } from "purr";
import ContextMenuPreview from "../previews/ContextMenuPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ContextMenuHost",
  group: "Overlays & menus",
  component: ContextMenuHost,
  description:
    "Mount once; it shows whatever `menu.show(event, entries, title)`, `menu.showFor(button, entries)` or `menu.showAt(x, y, entries)` opens, one menu at a time. The entries may be a function, re-read while open, so a `keepOpen` toggle shows its new state.",
  keywords: ["menu", "right-click", "contextmenu", "menu.show"],
  controls: {
    title: { type: "text", pseudo: true, optional: true, value: "Design the schema" },
  },
  events: { "entry.run": true },
  code: (args) => `<script lang="ts">
  import { ContextMenuHost, menu } from "purr";
</script>

<!-- once, at the root -->
<ContextMenuHost />

<!-- anywhere -->
<div oncontextmenu={(e) => menu.show(e, () => noteMenu()${args.title ? `, ${JSON.stringify(args.title)}` : ""})}>…</div>
<IconButton label="More" onclick={(e) => menu.showFor(e.currentTarget, noteMenu, null, "bottom-end")}>
  <DotsThree />
</IconButton>`,
  preview: ContextMenuPreview,
});
