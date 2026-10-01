<script lang="ts">
  import { Button, Menu, entries, type MenuControl } from "purr";
  import { DotsThree } from "purr/icons";
  import { note, noteMenu } from "../lib/menus.svelte";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();
  let anchor = $state<HTMLElement | null>(null);
  let open = $state(false);
  let newTag = $state("");

  function close() {
    on.onclose();
    open = false;
  }

  function addTag(control: MenuControl) {
    const tag = newTag.trim();
    if (!tag) return;
    if (!note.all.includes(tag)) note.all = [...note.all, tag];
    note.tags = [...note.tags, tag];
    newTag = "";
    on["entry.run"](`Tag: ${tag}`);
    control.close();
  }
</script>

{#snippet tagInput(control: MenuControl)}
  <form
    class="tag-input"
    onsubmit={(e) => {
      e.preventDefault();
      addTag(control);
    }}
  >
    <input class="field-input" placeholder="New tag…" aria-label="New tag" bind:value={newTag} />
  </form>
{/snippet}

<span class="anchor" bind:this={anchor}>
  <Button onclick={() => (open ? close() : (open = true))} aria-expanded={open}>
    <DotsThree weight="bold" /> More
  </Button>
</span>
<span class="muted state">
  {note.status} · {note.tags.join(", ") || "no tags"}
  <span class="swatch swatch--round" style:--c={note.color}></span>
</span>

{#if open && anchor}
  <Menu
    {...props}
    {anchor}
    title={args.title ? String(args.title) : null}
    entries={entries(...noteMenu((label) => on["entry.run"](label), tagInput))}
    onclose={close}
  />
{/if}

<style>
  .anchor {
    display: inline-flex;
  }
  .state {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-3);
    font-size: var(--fs-sm);
  }
  .tag-input {
    padding: var(--gap-1) var(--gap-2);
  }
  .tag-input input {
    width: 100%;
  }
</style>
