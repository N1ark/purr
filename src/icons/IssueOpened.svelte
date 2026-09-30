<script lang="ts">
  // Phosphor-style open issue, which Phosphor lacks: a ring around a dot.
  import type { IconComponentProps } from "phosphor-svelte";
  import { STROKE, circle } from "./weights";

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
  {#if weight === "fill"}
    <path
      fill-rule="evenodd"
      d={circle(128, 128, 104) + circle(128, 128, 52) + circle(128, 128, 28)}
    />
  {:else}
    {#if weight === "duotone"}
      <circle cx="128" cy="128" r="96" opacity="0.2" />
    {/if}
    <circle cx="128" cy="128" r="96" fill="none" stroke={color} stroke-width={stroke} />
    <circle cx="128" cy="128" r={20 + stroke / 2} />
  {/if}
</svg>
