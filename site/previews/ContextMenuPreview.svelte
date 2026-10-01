<script lang="ts">
  import { Button, IconButton, Kbd, menu } from "purr";
  import { DotsThree } from "purr/icons";
  import { note, noteMenu } from "../lib/menus.svelte";
  import type { PreviewProps } from "../lib/story";

  const { args, on }: PreviewProps = $props();
  const title = $derived(args.title ? String(args.title) : null);
  const entries = () => noteMenu((label) => on["entry.run"](label));
</script>

<div class="s-stack">
  <div
    class="target"
    role="application"
    aria-label="Right-click for a menu"
    oncontextmenu={(e) => menu.show(e, entries, title)}
  >
    Right-click here · {note.status} · {note.tags.join(", ") || "no tags"}
    <span class="swatch swatch--round" style:--c={note.color}></span>
  </div>
  <div class="s-row">
    <IconButton
      label="More"
      onclick={(e) => menu.showFor(e.currentTarget, entries, null, "bottom-end")}
    >
      <DotsThree weight="bold" />
    </IconButton>
    <Button onclick={() => menu.showAt(innerWidth / 2, innerHeight / 3, entries, title)}>
      At a point
    </Button>
    <span class="muted hint">Arrows walk, <Kbd hint="→" /> opens a submenu, letters jump.</span>
  </div>
</div>

<style>
  .target {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    padding: var(--sp-5) calc(var(--sp-5) * 2);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-lg);
    color: var(--muted);
  }
  .hint {
    font-size: var(--fs-sm);
  }
</style>
