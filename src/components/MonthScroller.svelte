<script lang="ts">
  // Weeks in one continuous scroll that snaps to each month's first week, as macOS Calendar
  // does; six weeks fill the view, and only the months around the one in view are rendered.
  import { tick, type Snippet } from "svelte";
  import DayCell from "./DayCell.svelte";
  import { firstWeekday, type CalendarDay } from "../lib/calendar";
  import { dayKey, formatMonth, formatWeekday } from "../lib/time";

  interface Props {
    /** The month in view; bind it to follow the scroll, set it to scroll there. */
    year: number;
    /** 0-based, as `Date` counts. */
    month: number;
    /** The day marked as today, as `dayKey` writes it; the device's by default. */
    today?: string;
    /** 0 = Sunday; the reader's locale's by default. */
    weekStart?: number;
    /** A day drawn as a drop target, while something is dragged over it. */
    target?: string | null;
    /** Under a day's number: what is on that day. */
    day?: Snippet<[CalendarDay]>;
    /** Beside a day's number, shown on hover and focus: an add button. */
    actions?: Snippet<[CalendarDay]>;
  }

  let {
    year = $bindable(),
    month = $bindable(),
    today,
    weekStart,
    target = null,
    day,
    actions,
  }: Props = $props();

  /** Months rendered on either side of the anchor. */
  const SPAN = 4;
  const ROWS = 6;
  const index = (y: number, m: number) => y * 12 + m;
  const first = (i: number) => new Date(Math.floor(i / 12), ((i % 12) + 12) % 12, 1);

  // svelte-ignore state_referenced_locally
  let anchor = $state(index(year, month));
  // svelte-ignore state_referenced_locally
  let shown = $state(index(year, month));
  let viewport = $state<HTMLElement | null>(null);
  let rowH = $state(0);
  let settle: ReturnType<typeof setTimeout> | undefined;

  let localeStart = $state(1);
  $effect(() => {
    localeStart = firstWeekday();
  });
  const start = $derived(weekStart ?? localeStart);

  /** Every week from the first rendered month's to a full view past the last one's. */
  const weeks = $derived.by(() => {
    const from = first(anchor - SPAN);
    from.setDate(1 - ((from.getDay() - start + 7) % 7));
    const until = first(anchor + SPAN + 1);
    const out: { days: CalendarDay[]; opens: number | null }[] = [];
    for (const d = from; d < until || out.length < ROWS;) {
      const days: CalendarDay[] = [];
      let opens: number | null = null;
      for (let i = 0; i < 7; i++, d.setDate(d.getDate() + 1)) {
        days.push({ key: dayKey(d), date: d.getDate(), inMonth: true });
        if (d.getDate() === 1) opens = index(d.getFullYear(), d.getMonth());
      }
      out.push({ days, opens });
    }
    return out;
  });
  const now = $derived(today ?? dayKey(Date.now()));
  const prefix = $derived(dayKey(first(shown)).slice(0, 8));

  const rowOf = (i: number) =>
    Math.max(
      0,
      weeks.findIndex((w) => w.opens === i),
    );
  /** The month most of the view shows: its third week's. */
  function inView(): number {
    const top = Math.round((viewport?.scrollTop ?? 0) / (rowH || 1));
    const key = weeks[Math.min(top + 2, weeks.length - 1)].days[6].key;
    return index(+key.slice(0, 4), +key.slice(5, 7) - 1);
  }

  function report(i: number) {
    shown = i;
    year = first(i).getFullYear();
    month = first(i).getMonth();
  }

  async function recentre(i: number) {
    anchor = i;
    await tick();
    if (viewport) viewport.scrollTop = rowOf(i) * rowH;
  }

  function onscroll() {
    if (!viewport || !rowH) return;
    const i = inView();
    if (i !== shown) report(i);
    clearTimeout(settle);
    settle = setTimeout(() => {
      if (Math.abs(shown - anchor) >= SPAN - 1) void recentre(shown);
    }, 150);
  }

  // Set from outside (a "Today" button): glide there when it's rendered, jump otherwise.
  $effect(() => {
    const want = index(year, month);
    if (want === shown || !viewport) return;
    shown = want;
    if (Math.abs(want - anchor) < SPAN)
      viewport.scrollTo({ top: rowOf(want) * rowH, behavior: "smooth" });
    else void recentre(want);
  });

  // Six weeks fill the view, whatever its height; a resize keeps the month in view.
  $effect(() => {
    const el = viewport;
    if (!el) return;
    const fit = () => {
      rowH = el.clientHeight / ROWS;
      void tick().then(() => (el.scrollTop = rowOf(shown) * rowH));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(settle);
    };
  });
</script>

<div class="month-scroller">
  <div class="weekdays" aria-hidden="true">
    {#each weeks[0].days as d (d.key)}<span>{formatWeekday(d.key)}</span>{/each}
  </div>
  <div
    class="viewport"
    bind:this={viewport}
    {onscroll}
    data-scroll
    role="grid"
    aria-label={formatMonth(first(shown))}
    style:--week-h="{rowH}px"
  >
    {#each weeks as week (week.days[0].key)}
      <div class="week" class:opens={week.opens !== null} role="row">
        {#each week.days as d (d.key)}
          <DayCell
            {d}
            {now}
            out={!d.key.startsWith(prefix)}
            target={target === d.key}
            {day}
            {actions}
          />
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .month-scroller {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    flex: none;
  }
  .weekdays span {
    padding: var(--gap-2) var(--gap-3);
    font-size: var(--fs-micro);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .viewport {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--border);
  }
  .viewport::-webkit-scrollbar {
    display: none;
  }
  .week {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 1px;
    height: var(--week-h);
    padding-bottom: 1px;
  }
  .week.opens {
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
</style>
