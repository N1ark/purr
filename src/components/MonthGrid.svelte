<script lang="ts">
  // A month as a six-week grid of days; what sits in a day is the app's.
  import type { Snippet } from "svelte";
  import { firstWeekday, monthGrid, type CalendarDay } from "../lib/calendar";
  import { dayKey, formatMonth, formatWeekday } from "../lib/time";
  import DayCell from "./DayCell.svelte";

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
        <DayCell {d} {now} out={!d.inMonth} target={target === d.key} {day} {actions} />
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
</style>
