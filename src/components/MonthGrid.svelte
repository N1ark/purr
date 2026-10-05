<script lang="ts">
  // A month as a six-week grid of days; what sits in a day is the app's.
  import type { Snippet } from "svelte";
  import { firstWeekday, monthGrid, type CalendarDay } from "../lib/calendar";
  import { dayKey, formatDate, formatMonth, formatWeekday } from "../lib/time";

  interface Props {
    year: number;
    /** 0-based, as `Date` counts. */
    month: number;
    /** The day marked as today, as `dayKey` writes it; the device's by default. */
    today?: string;
    /** 0 = Sunday; the reader's locale's by default. */
    weekStart?: number;
    /** A day drawn as a drop target, while something is dragged over it. */
    target?: string | null;
    /** The grid's accessible name; the month and year by default. */
    label?: string;
    /** Under a day's number: what is on that day. */
    day?: Snippet<[CalendarDay]>;
    /** Beside a day's number, shown on hover and focus: an add button. */
    actions?: Snippet<[CalendarDay]>;
  }

  let { year, month, today, weekStart, target = null, label, day, actions }: Props = $props();

  // The locale is read once mounted: a server has no reader.
  let localeStart = $state(1);
  $effect(() => {
    localeStart = firstWeekday();
  });

  const days = $derived(monthGrid(year, month, weekStart ?? localeStart));
  const weeks = $derived(Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7)));
  const now = $derived(today ?? dayKey(Date.now()));
</script>

<div class="month-grid" role="grid" aria-label={label ?? formatMonth(new Date(year, month, 1))}>
  <div class="week" role="row">
    {#each days.slice(0, 7) as d (d.key)}
      <div class="weekday" role="columnheader" aria-label={formatWeekday(d.key, "long")}>
        {formatWeekday(d.key)}
      </div>
    {/each}
  </div>
  {#each weeks as week, i (i)}
    <div class="week" role="row">
      {#each week as d (d.key)}
        <div
          class="day"
          class:out={!d.inMonth}
          class:is-target={target === d.key}
          role="gridcell"
          aria-label={formatDate(d.key, { style: "long" })}
          aria-current={d.key === now ? "date" : undefined}
          data-day={d.key}
        >
          <div class="head">
            <span class="num">{d.date}</span>
            {#if actions}<span class="actions">{@render actions(d)}</span>{/if}
          </div>
          {@render day?.(d)}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .month-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: auto repeat(6, minmax(var(--month-row-min, 0px), 1fr));
    gap: 1px;
    height: 100%;
    min-height: 0;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .week {
    display: contents;
  }
  .weekday {
    padding: var(--gap-2) var(--gap-3);
    font-size: var(--fs-micro);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
    background: var(--bg2);
  }
  .day {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    min-height: 0;
    padding: var(--gap-1) var(--gap-2) var(--gap-2);
    background: var(--bg2);
    overflow: hidden;
  }
  .day.out {
    background: var(--bg);
  }
  .day.out .num {
    color: var(--faint);
  }
  .day.is-target {
    background: var(--theme-soft);
    box-shadow: inset 0 0 0 1.5px var(--theme2);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 20px;
  }
  .num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--gap-1);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    border-radius: var(--radius-pill);
  }
  [aria-current="date"] .num {
    color: var(--on-accent);
    background: var(--theme);
    font-weight: 600;
  }
  .actions {
    display: inline-flex;
  }
  @media (hover: hover) {
    .actions {
      opacity: 0;
      transition: opacity var(--dur);
    }
    .day:hover .actions,
    .actions:focus-within {
      opacity: 1;
    }
  }
</style>
