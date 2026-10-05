<script lang="ts">
  import { Masonry, colorFromSeed } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();

  const tiles = $derived(
    Array.from({ length: Number(args.count ?? 0) }, (_, i) => ({
      n: i + 1,
      ratio: [0.45, 0.9, 0.6, 0.5, 1.1, 0.75][i % 6],
    })),
  );
</script>

<div class="frame">
  <Masonry
    items={tiles}
    ratio={(t) => t.ratio}
    minWidth={Number(args.minWidth ?? 160)}
    columns={args.columns ? Number(args.columns) : undefined}
    gap={String(args.gap ?? "var(--sp-4)")}
  >
    {#snippet item(tile)}
      <div class="tile" style:aspect-ratio="1 / {tile.ratio}" style:--c={colorFromSeed(tile.n)}>
        {tile.n}
      </div>
    {/snippet}
  </Masonry>
</div>

<style>
  .frame {
    width: 100%;
  }
  .tile {
    display: grid;
    place-items: center;
    border-radius: var(--radius);
    background: color-mix(in oklab, var(--c) 35%, var(--bg));
    font-weight: 650;
    color: var(--color2);
  }
</style>
