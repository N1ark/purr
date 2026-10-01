<script lang="ts" generics="T">
  // Items of different heights in columns that end level, in roughly reading order: each goes
  // to the shortest column. Until it has been measured (server rendering, first frame) the
  // browser's own CSS columns stand in, so the page never renders empty.
  import type { Snippet } from "svelte";

  import { columnCount, packColumns } from "../lib/masonry";

  interface Props {
    items: readonly T[];
    /** An item's height over its width, as drawn. */
    ratio: (item: T, index: number) => number;
    item: Snippet<[T, number]>;
    /** Pixels: the narrowest a column gets before there is one fewer. */
    minWidth?: number;
    /** A fixed number of columns instead. */
    columns?: number;
    /** Between columns and between items: any CSS length. */
    gap?: string;
    class?: string;
  }

  const {
    items,
    ratio,
    item,
    minWidth = 160,
    columns,
    gap = "var(--sp-4)",
    class: extra,
  }: Props = $props();

  let width = $state(0);

  const count = $derived(columns ?? (width > 0 ? columnCount(width, minWidth) : 0));
  const packed = $derived(count ? packColumns(items.map(ratio), count) : []);
</script>

<div
  class={["masonry", extra]}
  bind:clientWidth={width}
  style:--masonry-gap={gap}
  style:--masonry-min="{minWidth}px"
>
  {#if count}
    {#each packed as column, c (c)}
      <div class="column">
        {#each column as index (index)}
          {@render item(items[index], index)}
        {/each}
      </div>
    {/each}
  {:else}
    <div class="flow">
      {#each items as entry, index (index)}
        <div class="cell">{@render item(entry, index)}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .masonry {
    display: flex;
    gap: var(--masonry-gap);
    min-width: 0;
  }
  .column {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--masonry-gap);
    min-width: 0;
  }
  .flow {
    flex: 1;
    min-width: 0;
    columns: var(--masonry-min);
    column-gap: var(--masonry-gap);
  }
  .cell {
    margin-bottom: var(--masonry-gap);
    break-inside: avoid;
  }
</style>
