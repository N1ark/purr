<script lang="ts">
  // A small radial progress: `value` of `max`, green once complete, dashed when there is nothing.
  interface Props {
    value: number;
    max: number;
    /** Diameter in pixels. */
    size?: number;
    /** Accessible name, e.g. "3 of 5 done". */
    label?: string;
  }

  const { value, max, size = 15, label }: Props = $props();

  const stroke = $derived(Math.max(1.5, size / 6));
  const r = $derived(size / 2 - stroke / 2 - 0.5);
  const c = $derived(2 * Math.PI * r);
  const frac = $derived(max > 0 ? Math.min(1, Math.max(0, value / max)) : 0);
  const complete = $derived(max > 0 && value >= max);
</script>

<svg
  class="ring"
  class:complete
  class:empty={max <= 0}
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
  role="progressbar"
  aria-label={label}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuenow={value}
>
  <circle class="track" cx={size / 2} cy={size / 2} {r} stroke-width={stroke} />
  <circle
    class="fill"
    cx={size / 2}
    cy={size / 2}
    {r}
    stroke-width={stroke}
    stroke-dasharray={c}
    stroke-dashoffset={c * (1 - frac)}
    transform="rotate(-90 {size / 2} {size / 2})"
  />
</svg>

<style>
  .ring {
    display: block;
    flex: none;
  }
  .track {
    fill: none;
    stroke: var(--border-strong);
  }
  .empty .track {
    stroke-dasharray: 2 2;
  }
  .fill {
    fill: none;
    stroke: var(--theme2);
    stroke-linecap: round;
    transition: stroke-dashoffset var(--dur-slow) var(--ease);
  }
  .empty .fill {
    display: none;
  }
  .complete .fill {
    stroke: var(--success);
  }
</style>
