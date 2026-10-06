<script lang="ts">
  // One day of `MonthGrid` or `MonthScroller`: its number, its actions and what is on it.
  import type { Snippet } from "svelte";
  import type { CalendarDay } from "../lib/calendar";
  import { formatDate } from "../lib/time";

  interface Props {
    d: CalendarDay;
    /** Today's key. */
    now: string;
    /** Drawn faded: a day of another month. */
    out: boolean;
    target: boolean;
    day?: Snippet<[CalendarDay]>;
    actions?: Snippet<[CalendarDay]>;
  }

  let { d, now, out, target, day, actions }: Props = $props();
</script>

<div
  class="day"
  class:out
  class:is-target={target}
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

<style>
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
  /* A phone's seven columns are narrow: every pixel goes to what is on the day. */
  :global(body.mobile) .day {
    padding-inline: var(--gap-1);
  }
  /* A full day clips its last items rather than squashing every one. */
  .day > :global(*) {
    flex-shrink: 0;
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
