<script lang="ts">
  // Phosphor-style companion to GitPullRequest: the branch, cut short by a cross.
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
  <g
    fill={weight === "fill" ? color : "none"}
    fill-opacity={weight === "duotone" ? 0.2 : undefined}
    stroke={color}
    stroke-width={stroke}
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="72" cy="64" r="24" />
    <circle cx="72" cy="192" r="24" />
    <circle cx="200" cy="192" r="24" />
  </g>
  <g fill="none" stroke={color} stroke-width={stroke} stroke-linecap="round">
    <line x1="72" y1="88" x2="72" y2="168" />
    <line x1="200" y1="112" x2="200" y2="168" />
    <line x1="176" y1="40" x2="224" y2="88" />
    <line x1="224" y1="40" x2="176" y2="88" />
  </g>
</svg>
