<script lang="ts">
  // A time of day to pick, for a popover: a field that reads a typed time (Enter picks it) over
  // a list of steps, scrolled to the picked one (or the morning).
  import { formatClock, parseTime } from "../lib/time";

  interface Props {
    /** The picked time, `HH:mm`. */
    value?: string | null;
    /** A time, or null for "no time" when `noneLabel` offers it. */
    onpick: (time: string | null) => void;
    /** Minutes between the listed times. */
    step?: number;
    /** Offers a first entry that picks no time at all. */
    noneLabel?: string;
    label?: string;
    placeholder?: string;
  }

  let {
    value = null,
    onpick,
    step = 30,
    noneLabel,
    label = "Time",
    placeholder = "Type a time",
  }: Props = $props();

  let typed = $state("");
  const parsed = $derived(parseTime(typed));

  const p2 = (n: number) => String(n).padStart(2, "0");
  const times = $derived(
    Array.from({ length: Math.ceil(1440 / step) }, (_, i) => {
      const m = i * step;
      return `${p2(Math.floor(m / 60))}:${p2(m % 60)}`;
    }),
  );
  const show = (time: string) =>
    formatClock(new Date(2000, 0, 1, +time.slice(0, 2), +time.slice(3)));

  let list = $state<HTMLElement | null>(null);
  $effect(() => {
    const at = parsed ?? value ?? "09:00";
    const el = [...(list?.querySelectorAll<HTMLElement>("[data-time]") ?? [])].find(
      (b) => b.dataset.time! >= at,
    );
    if (el && list) list.scrollTop = el.offsetTop - list.clientHeight / 3;
  });
</script>

<div class="time-picker">
  <input
    class="field-input"
    aria-label={label}
    aria-invalid={!!typed.trim() && !parsed}
    {placeholder}
    bind:value={typed}
    data-autofocus
    autocomplete="off"
    spellcheck="false"
    onkeydown={(e) => {
      if (e.key === "Enter" && parsed) {
        e.preventDefault();
        onpick(parsed);
      }
    }}
  />
  <div class="list" role="listbox" aria-label={label} bind:this={list}>
    {#if noneLabel}
      <button
        class="time none"
        role="option"
        aria-selected={value === null}
        onclick={() => onpick(null)}>{noneLabel}</button
      >
    {/if}
    {#each times as time (time)}
      <button
        class="time"
        role="option"
        aria-selected={time === value}
        data-time={time}
        onclick={() => onpick(time)}>{show(time)}</button
      >
    {/each}
  </div>
</div>

<style>
  .time-picker {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    width: 120px;
  }
  .list {
    position: relative;
    display: flex;
    flex-direction: column;
    max-height: 200px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .time {
    flex: none;
    min-height: var(--row-h);
    padding: 0 var(--gap-3);
    text-align: left;
    font-size: var(--fs-sm);
    font-variant-numeric: tabular-nums;
    color: var(--color);
    border-radius: var(--radius);
  }
  .time.none {
    color: var(--muted);
  }
  @media (hover: hover) {
    .time:hover {
      background: var(--chip);
    }
  }
  .time[aria-selected="true"] {
    color: var(--on-accent);
    background: var(--theme);
  }
</style>
