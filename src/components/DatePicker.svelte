<script lang="ts">
  // A small month to pick a day from, for a popover: arrows move the focused day (Page Up/Down
  // a month), Enter or a click picks it.
  import { tick } from "svelte";
  import IconButton from "./IconButton.svelte";
  import CaretLeftIcon from "phosphor-svelte/lib/CaretLeftIcon";
  import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
  import { firstWeekday, monthGrid } from "../lib/calendar";
  import { addDays, dayKey, formatDate, formatMonth, formatWeekday } from "../lib/time";

  interface Props {
    /** The picked day, as `dayKey` writes it. */
    value?: string | null;
    onpick: (day: string) => void;
    /** The day marked as today; the device's by default. */
    today?: string;
    /** 0 = Sunday; the reader's locale's by default. */
    weekStart?: number;
    prevLabel?: string;
    nextLabel?: string;
  }

  let {
    value = null,
    onpick,
    today,
    weekStart,
    prevLabel = "Previous month",
    nextLabel = "Next month",
  }: Props = $props();

  const now = $derived(today ?? dayKey(Date.now()));
  // svelte-ignore state_referenced_locally
  let focused = $state(value ?? today ?? dayKey(Date.now()));
  // svelte-ignore state_referenced_locally
  let shown = $state(new Date(+focused.slice(0, 4), +focused.slice(5, 7) - 1, 1));
  let grid = $state<HTMLElement | null>(null);

  let localeStart = $state(1);
  $effect(() => {
    localeStart = firstWeekday();
  });
  const days = $derived(monthGrid(shown.getFullYear(), shown.getMonth(), weekStart ?? localeStart));

  function turn(step: number) {
    shown = new Date(shown.getFullYear(), shown.getMonth() + step, 1);
    const last = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate();
    focused = dayKey(
      new Date(shown.getFullYear(), shown.getMonth(), Math.min(+focused.slice(8), last)),
    );
  }

  async function move(key: string) {
    focused = key;
    const d = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, 1);
    if (d.getTime() !== shown.getTime()) shown = d;
    await tick();
    grid?.querySelector<HTMLElement>(`[data-day="${key}"]`)?.focus();
  }

  function onkeydown(e: KeyboardEvent) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) void move(addDays(focused, step));
    else if (e.key === "PageUp" || e.key === "PageDown") {
      turn(e.key === "PageUp" ? -1 : 1);
      void move(focused);
    } else return;
    e.preventDefault();
  }
</script>

<div class="date-picker">
  <div class="bar">
    <span class="month">{formatMonth(shown)}</span>
    <IconButton label={prevLabel} size="sm" onclick={() => turn(-1)}><CaretLeftIcon /></IconButton>
    <IconButton label={nextLabel} size="sm" onclick={() => turn(1)}><CaretRightIcon /></IconButton>
  </div>
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class="days" role="grid" aria-label={formatMonth(shown)} bind:this={grid} {onkeydown}>
    {#each days.slice(0, 7) as d (d.key)}
      <span class="weekday" aria-hidden="true">{formatWeekday(d.key).slice(0, 2)}</span>
    {/each}
    {#each days as d (d.key)}
      <button
        class="day"
        class:out={!d.inMonth}
        tabindex={d.key === focused ? 0 : -1}
        aria-label={formatDate(d.key, { style: "long" })}
        aria-pressed={d.key === value}
        aria-current={d.key === now ? "date" : undefined}
        data-day={d.key}
        data-autofocus={d.key === focused || undefined}
        onclick={() => onpick(d.key)}>{d.date}</button
      >
    {/each}
  </div>
</div>

<style>
  .date-picker {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    width: max-content;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: var(--gap-1);
  }
  .month {
    flex: 1;
    padding-left: var(--gap-2);
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--color2);
  }
  .month::first-letter {
    text-transform: uppercase;
  }
  .days {
    display: grid;
    grid-template-columns: repeat(7, var(--btn));
    gap: 2px;
  }
  .weekday {
    text-align: center;
    font-size: var(--fs-nano);
    text-transform: uppercase;
    color: var(--muted);
  }
  .day {
    height: var(--btn);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color);
    border-radius: var(--radius-pill);
  }
  .day.out {
    color: var(--faint);
  }
  @media (hover: hover) {
    .day:hover {
      background: var(--chip);
    }
  }
  .day[aria-current="date"] {
    color: var(--theme2);
    font-weight: 600;
  }
  .day[aria-pressed="true"] {
    color: var(--on-accent);
    background: var(--theme);
    font-weight: 600;
  }
</style>
