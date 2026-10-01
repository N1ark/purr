<script lang="ts">
  // A grid of colour swatches: pick one, optionally "automatic" (no fixed colour), optionally
  // any colour through the native picker. Put it in a popover or a menu; it owns no overlay.
  import LightningIcon from "phosphor-svelte/lib/LightningIcon";
  import PlusIcon from "phosphor-svelte/lib/PlusIcon";
  import { tooltip } from "../actions/tooltip";

  interface Props {
    colors: readonly string[];
    /** The current colour; `null` is "automatic". Compared case-insensitively. */
    value: string | null;
    onpick: (color: string | null) => void;
    /** Accessible name of the grid. */
    label?: string;
    columns?: number;
    shape?: "round" | "square";
    /** Offer "automatic", which picks `null`. */
    auto?: boolean;
    autoLabel?: string;
    /** Offer any colour through the native picker. */
    custom?: boolean;
    customLabel?: string;
    /** Every change while the native picker is open, for a live preview. */
    oncustominput?: (color: string) => void;
    /** The colour the native picker settled on; defaults to `onpick`. */
    oncustom?: (color: string) => void;
    /** Right-click on a swatch, e.g. to remove a colour the user added. */
    onswatchcontextmenu?: (e: MouseEvent, color: string) => void;
    /** A swatch's accessible name; defaults to the colour itself. */
    colorLabel?: (color: string) => string;
    /** A swatch's tooltip, e.g. how to remove a colour the user added; none by default. */
    colorTip?: (color: string) => string | null;
  }

  const {
    colors,
    value,
    onpick,
    label = "Colour",
    columns = 8,
    shape = "square",
    auto = false,
    autoLabel = "Automatic",
    custom = false,
    customLabel = "Any colour",
    oncustominput,
    oncustom,
    onswatchcontextmenu,
    colorLabel = (c) => c,
    colorTip,
  }: Props = $props();

  const current = $derived(value?.toLowerCase() ?? null);
</script>

<div
  class="grid"
  role="group"
  aria-label={label}
  style:grid-template-columns="repeat({columns}, var(--swatch))"
>
  {#each colors as color (color)}
    <button
      type="button"
      class={["swatch", shape === "round" && "swatch--round"]}
      class:is-on={color.toLowerCase() === current}
      style:--c={color}
      aria-label={colorLabel(color)}
      aria-pressed={color.toLowerCase() === current}
      use:tooltip={colorTip?.(color)}
      onclick={() => onpick(color)}
      oncontextmenu={onswatchcontextmenu && ((e) => onswatchcontextmenu(e, color))}
    ></button>
  {/each}
  {#if auto}
    <button
      type="button"
      class={["swatch extra", shape === "round" && "swatch--round"]}
      class:is-on={value === null}
      aria-label={autoLabel}
      aria-pressed={value === null}
      use:tooltip={autoLabel}
      onclick={() => onpick(null)}
    >
      <LightningIcon weight="fill" />
    </button>
  {/if}
  {#if custom}
    <!-- The native panel anchors to its input, so the input lies exactly over the swatch. -->
    <label class={["swatch extra", shape === "round" && "swatch--round"]} use:tooltip={customLabel}>
      <PlusIcon weight="bold" />
      <input
        type="color"
        value={value ?? colors[0] ?? "#000000"}
        aria-label={customLabel}
        oninput={(e) => oncustominput?.(e.currentTarget.value)}
        onchange={(e) => (oncustom ?? onpick)(e.currentTarget.value)}
      />
    </label>
  {/if}
</div>

<style>
  .grid {
    display: grid;
    gap: var(--gap-3);
  }
  .extra {
    position: relative;
    display: grid;
    place-items: center;
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--border-strong);
    font-size: calc(var(--swatch) * 0.65);
    color: var(--muted);
    cursor: pointer;
  }
  .extra.is-on {
    box-shadow:
      inset 0 0 0 1px var(--border-strong),
      0 0 0 1.5px var(--bg),
      0 0 0 3px var(--color2);
    color: var(--color2);
  }
  @media (hover: hover) {
    .extra:hover {
      box-shadow: inset 0 0 0 1px var(--theme2);
      color: var(--theme2);
    }
  }
  input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
</style>
