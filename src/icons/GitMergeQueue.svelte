<script lang="ts">
  // Phosphor-style companion to GitMerge: the branch, with pull requests waiting in line beside it.
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
  // The waiting dots grow with the line, as the branch's circles do.
  const dot = $derived(10 + stroke * 0.5);
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
  </g>
  <g fill={color} stroke="none">
    <circle cx="192" cy="64" r={dot} />
    <circle cx="192" cy="128" r={dot} />
    <circle cx="192" cy="192" r={dot} />
  </g>
  <line
    x1="72"
    y1="88"
    x2="72"
    y2="168"
    fill="none"
    stroke={color}
    stroke-width={stroke}
    stroke-linecap="round"
  />
</svg>
