<script lang="ts">
  import { EmptyState, VirtualList } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();

  const count = $derived(Math.max(0, Math.min(1_000_000, Number(args.count) || 0)));
  // `$state.raw`: a large collection is never made deeply reactive.
  const rows = $derived.by(() => {
    const out = new Array(count);
    for (let i = 0; i < count; i++) out[i] = { id: i, lines: 1 + (i % 4) };
    return out as { id: number; lines: number }[];
  });
  const fixed = $derived(Number(args.rowHeight) || 26);
  const rowHeight = $derived(
    args.variable ? (row: { lines: number }) => 12 + row.lines * 18 : fixed,
  );
</script>

<div class="box surface">
  <VirtualList
    items={rows}
    {rowHeight}
    key={(row) => row.id}
    overscan={Number(args.overscan ?? 6)}
    padding={args.padding ? String(args.padding) : undefined}
    label={args.label ? String(args.label) : undefined}
    role={args.role === "listbox" ? "listbox" : "list"}
  >
    {#snippet children(row)}
      {#if args.variable}
        <div class="tall">{row.lines} line{row.lines > 1 ? "s" : ""} · row {row.id + 1}</div>
      {:else}
        <div class="row-item">Row {row.id + 1}</div>
      {/if}
    {/snippet}
    {#snippet empty()}
      <EmptyState inline text="No rows" />
    {/snippet}
  </VirtualList>
</div>
<p class="muted">{count.toLocaleString()} rows; only the visible ones are in the DOM.</p>

<style>
  .box {
    display: flex;
    flex-direction: column;
    width: 360px;
    max-width: 100%;
    height: 280px;
    overflow: hidden;
    box-shadow: none;
  }
  .tall {
    width: 100%;
    height: 100%;
    padding: var(--sp-1) var(--sp-4);
    border-bottom: 1px solid var(--border);
    font-size: var(--fs-sm);
  }
  p {
    width: 100%;
    margin: 0;
    text-align: center;
    font-size: var(--fs-sm);
  }
</style>
