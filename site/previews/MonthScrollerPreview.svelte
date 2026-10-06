<script lang="ts">
  import { IconButton, MonthScroller, addDays, dayKey, formatMonth } from "purr";
  import { CaretLeft, CaretRight } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();

  const today = dayKey(Date.now());
  const events: Record<string, string> = {
    [addDays(today, -2)]: "Retro",
    [today]: "Stand-up",
    [addDays(today, 9)]: "Design review",
    [addDays(today, 30)]: "Release",
  };
  let year = $state(new Date().getFullYear());
  let month = $state(new Date().getMonth());
  const go = (step: number) => {
    const d = new Date(year, month + step, 1);
    year = d.getFullYear();
    month = d.getMonth();
  };
</script>

<div class="frame">
  <div class="bar">
    <IconButton label="Previous month" onclick={() => go(-1)}><CaretLeft /></IconButton>
    <IconButton label="Next month" onclick={() => go(1)}><CaretRight /></IconButton>
    <strong>{formatMonth(new Date(year, month, 1))}</strong>
  </div>
  <MonthScroller
    bind:year
    bind:month
    weekStart={args.weekStart === "locale" ? undefined : Number(args.weekStart)}
  >
    {#snippet day(d)}
      {#if events[d.key]}<span class="event">{events[d.key]}</span>{/if}
    {/snippet}
  </MonthScroller>
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
  .event {
    padding: 1px var(--gap-3);
    font-size: var(--fs-micro);
    border-radius: var(--radius-sm);
    color: var(--color2);
    background: color-mix(in oklab, var(--theme2) 16%, transparent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
