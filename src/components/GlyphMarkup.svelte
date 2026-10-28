<script lang="ts">
  // `Glyph` for an icon of several shapes (purr's own, a duotone): its markup, parsed.
  import type { GlyphProps } from "./types";

  interface Props extends Omit<GlyphProps, "weight"> {
    /** SVG markup, from `purr/glyphs` or `glyph()`: never user content. */
    icon: string;
  }

  const {
    icon,
    size = "1em",
    color,
    mirrored = false,
    class: className,
    "aria-label": label,
    "aria-hidden": hidden,
  }: Props = $props();
</script>

<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 256 256"
  fill="currentColor"
  style:color
  transform={mirrored ? "scale(-1, 1)" : undefined}
  role={label ? "img" : undefined}
  aria-label={label}
  aria-hidden={hidden ?? (label ? undefined : "true")}>{@html icon}</svg
>
