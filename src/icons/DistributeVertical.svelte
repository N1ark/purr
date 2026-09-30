<script lang="ts">
  // Phosphor-style companion to the Align icons: a box spaced evenly between two level edges.
  import type { IconComponentProps } from "phosphor-svelte";
  import { STROKE } from "./weights";

  let {
    children,
    weight = "regular",
    color = "currentColor",
    size = "1em",
    mirrored = false,
    ...rest
  }: IconComponentProps = $props();

  const stroke = $derived(STROKE[weight]);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  width={size}
  height={size}
  fill={color}
  transform={mirrored ? "scale(-1, 1)" : undefined}
  viewBox="0 0 256 256"
  {...rest}
>
  {@render children?.()}
  <rect width="256" height="256" fill="none" />
  <g transform="rotate(90 128 128)">
    <rect
      x="96"
      y="56"
      width="64"
      height="144"
      rx="8"
      fill={weight === "fill" ? color : "none"}
      stroke={color}
      stroke-width={stroke}
      stroke-linejoin="round"
    />
    {#if weight === "duotone"}
      <rect x="96" y="56" width="64" height="144" rx="8" opacity="0.2" />
    {/if}
    <g stroke={color} stroke-width={stroke} stroke-linecap="round">
      <line x1="40" y1="40" x2="40" y2="216" />
      <line x1="216" y1="40" x2="216" y2="216" />
    </g>
  </g>
</svg>
