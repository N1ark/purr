<script lang="ts">
  import { IconButton, MonthGrid, addDays, dayKey, formatMonth } from "purr";
  import { CaretLeft, CaretRight, Plus } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();

  const today = dayKey(Date.now());
  const events: Record<string, string[]> = {
    [addDays(today, -2)]: ["Retro"],
    [today]: ["Stand-up", "Ship 1.0"],
    [addDays(today, 1)]: ["Design review"],
    [addDays(today, 4)]: ["Release notes", "Demo", "Dinner"],
  };
  let at = $state(new Date());
  const year = $derived(at.getFullYear());
  const month = $derived(at.getMonth());
</script>

<div class="frame">
  <div class="bar">
    <IconButton label="Previous month" onclick={() => (at = new Date(year, month - 1, 1))}
      ><CaretLeft /></IconButton
    >
    <IconButton label="Next month" onclick={() => (at = new Date(year, month + 1, 1))}
      ><CaretRight /></IconButton
    >
    <strong>{formatMonth(new Date(year, month, 1))}</strong>
  </div>
  <MonthGrid
    {year}
    {month}
    weekStart={args.weekStart === "locale" ? undefined : Number(args.weekStart)}
    target={args.target ? addDays(today, 2) : null}
  >
    {#snippet day(d)}
      {@const list = events[d.key] ?? []}
      {#each list.length > 2 ? list.slice(0, 1) : list as e (e)}
        <span class="event">{e}</span>
      {/each}
      {#if list.length > 2}<span class="more">+{list.length - 1} more</span>{/if}
    {/snippet}
    {#snippet actions(d)}
      <IconButton label="New event on {d.key}" size="sm"><Plus /></IconButton>
    {/snippet}
  </MonthGrid>
</div>

<style>
  .frame {
    width: 100%;
    height: 460px;
    display: flex;
    flex-direction: column;
    gap: var(--gap-3);
  }
  .bar {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
  }
  .more {
    padding: 0 var(--gap-3);
    font-size: var(--fs-micro);
    color: var(--muted);
  }
  .event {
    padding: 1px var(--gap-3);
    font-size: var(--fs-micro);
    border-left: 2px solid var(--theme2);
    border-radius: var(--radius-sm);
    background: var(--chip);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
