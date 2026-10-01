<script lang="ts">
  import {
    Segmented,
    Switch,
    formatAbsolute,
    formatClock,
    formatClockIn,
    formatDay,
    formatFull,
    formatRelative,
    isSameDay,
    setTwentyFourHourClock,
    startOfDay,
  } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const UNITS = [
    { id: "s", label: "seconds", ms: 1000 },
    { id: "min", label: "minutes", ms: 60_000 },
    { id: "h", label: "hours", ms: 3_600_000 },
    { id: "d", label: "days", ms: 86_400_000 },
    { id: "mo", label: "months", ms: 30 * 86_400_000 },
    { id: "y", label: "years", ms: 365 * 86_400_000 },
  ] as const;

  const now = Date.now();
  let amount = $state(-5);
  let unit = $state<(typeof UNITS)[number]["id"]>("min");
  let style = $state<"narrow" | "short" | "long">("narrow");
  const at = $derived(now + amount * UNITS.find((u) => u.id === unit)!.ms);

  // The formatters are not reactive: outputs that read them sit in `{#key clock}`.
  let clock = $state<"locale" | "24" | "12">("locale");
  function setClock(next: "locale" | "24" | "12") {
    setTwentyFourHourClock(next === "locale" ? undefined : next === "24");
    clock = next;
  }
  $effect(() => () => setTwentyFourHourClock(undefined));

  const toLocal = (ms: number) => {
    const d = new Date(ms);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  let picked = $state(toLocal(now - 86_400_000));
  const date = $derived(new Date(picked).getTime());

  const ZONES = [
    "UTC",
    "Europe/London",
    "Europe/Stockholm",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Not/AZone",
  ];
  let zone = $state("Asia/Tokyo");
</script>

<PageHeader
  title="Time"
  description="Dates as people read them, in the platform's locale. Each `Intl` formatter is built once and kept, so these are safe in a row rendered thousands of times. Inputs are a `Date`, epoch milliseconds or an ISO string."
  importLine={`import { formatRelative, formatDay, formatClock } from "purr";`}
  source="src/lib/time.ts"
/>

<Section
  title="formatRelative"
  description="`5m ago`, `in 2 days`, `just now`: the largest unit that fits, rounded. Anything under a minute is `justNow`."
  code={`formatRelative(date, { style: "${style}" }) // ${JSON.stringify(formatRelative(at, { now, style }))}`}
>
  <div class="s-stack fill">
    <div class="s-row">
      <input class="field-input amount" type="number" aria-label="Amount" bind:value={amount} />
      <select class="field-input short" aria-label="Unit" bind:value={unit}>
        {#each UNITS as u (u.id)}<option value={u.id}>{u.label}</option>{/each}
      </select>
      <span class="muted">from now</span>
      <Segmented
        label="Style"
        size="sm"
        options={[
          { id: "narrow", label: "narrow" },
          { id: "short", label: "short" },
          { id: "long", label: "long" },
        ]}
        bind:value={style}
      />
    </div>
    <input
      type="range"
      min="-120"
      max="120"
      aria-label="Amount"
      bind:value={amount}
      class="range"
    />
    <div class="big">{formatRelative(at, { now, style })}</div>
  </div>
</Section>

<Section
  title="Absolute formats"
  description="Pick a date. `formatDay` is a date separator: Today, Yesterday, a weekday, the year when it is not this one."
  code={`formatClock(date)     // the time
formatAbsolute(date)  // date and time, medium
formatFull(date)      // the long form, for a tooltip
formatDay(date)       // Today / Yesterday / Fri 12 Sep
isSameDay(date, Date.now())
startOfDay(date)      // local midnight, in ms`}
  block
>
  <div class="s-stack">
    <div class="s-row">
      <input
        type="datetime-local"
        class="field-input short"
        aria-label="Date"
        bind:value={picked}
      />
      <Segmented
        label="Clock"
        size="sm"
        options={[
          { id: "locale", label: "locale" },
          { id: "24", label: "24-hour" },
          { id: "12", label: "12-hour" },
        ]}
        bind:value={() => clock, setClock}
      />
    </div>
    {#key clock}
      <table class="s-table">
        <tbody>
          <tr><th>formatClock</th><td class="s-out">{formatClock(date)}</td></tr>
          <tr><th>formatAbsolute</th><td class="s-out">{formatAbsolute(date)}</td></tr>
          <tr><th>formatFull</th><td class="s-out">{formatFull(date)}</td></tr>
          <tr><th>formatDay</th><td class="s-out">{formatDay(date)}</td></tr>
          <tr>
            <th>formatDay, own labels</th>
            <td class="s-out">{formatDay(date, { today: "Idag", yesterday: "Igår" })}</td>
          </tr>
          <tr><th>formatRelative</th><td class="s-out">{formatRelative(date)}</td></tr>
          <tr><th>isSameDay(date, now)</th><td class="s-out">{isSameDay(date, Date.now())}</td></tr>
          <tr>
            <th>startOfDay</th>
            <td class="s-out"
              >{startOfDay(date)}
              <span class="muted">({formatAbsolute(startOfDay(date))})</span></td
            >
          </tr>
        </tbody>
      </table>
    {/key}
  </div>
</Section>

<Section
  title="setTwentyFourHourClock"
  description="An app's preference over the locale's habit: `true` for 14:30, `false` for 2:30 pm, `undefined` for the locale's. It clears the cached formatters; the toggle above calls it."
  code={`setTwentyFourHourClock(${clock === "locale" ? "undefined" : clock === "24"});`}
>
  <Switch
    label="24-hour clock"
    bind:checked={() => clock === "24", (on: boolean) => setClock(on ? "24" : "12")}
  />
  <span class="muted">24-hour clock</span>
  {#key clock}<span class="s-out">{formatClock(now)}</span>{/key}
</Section>

<Section
  title="formatClockIn"
  description="Someone else's local time, for a profile card; null when the platform does not know the zone."
  code={`formatClockIn(Date.now(), "${zone}") // ${JSON.stringify(formatClockIn(now, zone))}`}
>
  <select class="field-input short" aria-label="Time zone" bind:value={zone}>
    {#each ZONES as z (z)}<option value={z}>{z}</option>{/each}
  </select>
  {#key clock}<span class="s-out">{formatClockIn(now, zone) ?? "null"}</span>{/key}
</Section>

<style>
  .fill {
    width: 100%;
  }
  .amount {
    width: 90px;
  }
  .range {
    width: 100%;
    accent-color: var(--theme);
  }
  .big {
    font-size: var(--fs-xl);
    font-weight: 600;
    color: var(--color2);
  }
  .s-table th {
    width: 200px;
  }
  .short {
    width: 220px;
    max-width: 100%;
  }
</style>
