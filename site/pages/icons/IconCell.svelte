<script lang="ts">
  // One icon of the browser: loads its module on first render, then draws it with the props
  // the toolbar picked.
  import type { Component } from "svelte";
  import { Highlight } from "purr";
  import { cached, load, type IconEntry } from "./icons";

  interface Props {
    icon: IconEntry;
    indices: readonly number[];
    size: number;
    weight: string;
    color: string;
    mirrored: boolean;
    onpick: (icon: IconEntry) => void;
  }

  const { icon, indices, size, weight, color, mirrored, onpick }: Props = $props();

  let Glyph = $state<Component<any> | null>(null);

  $effect(() => {
    const entry = icon;
    Glyph = cached(entry.name) ?? null;
    if (Glyph) return;
    let live = true;
    load(entry).then((c) => {
      if (live) Glyph = c;
    });
    return () => {
      live = false;
    };
  });
</script>

<button type="button" class="cell" title={icon.name} onclick={() => onpick(icon)}>
  <span class="glyph" style:height="{size}px">
    {#if Glyph}<Glyph {size} {weight} {color} {mirrored} />{/if}
  </span>
  <span class="name truncate"><Highlight text={icon.name} {indices} /></span>
  {#if icon.own}<span class="own" aria-label="purr's own"></span>{/if}
</button>

<style>
  .cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-3);
    width: 100%;
    height: 100%;
    min-width: 0;
    padding: var(--sp-2);
    border-radius: var(--radius-lg);
    color: var(--color2);
  }
  .glyph {
    display: grid;
    place-items: center;
  }
  .name {
    max-width: 100%;
    font-size: var(--fs-xs);
    color: var(--muted);
  }
  .own {
    position: absolute;
    top: var(--sp-2);
    right: var(--sp-2);
    width: var(--sp-2);
    height: var(--sp-2);
    border-radius: 50%;
    background: var(--theme2);
  }
  @media (hover: hover) {
    .cell:hover {
      background: var(--bg3);
    }
    .cell:hover .name {
      color: var(--color2);
    }
  }
</style>
