<script lang="ts">
  // What a `purr/glyphs` icon of one path renders: none of a full icon's context, weights or
  // spreads. `glyph()` makes the components that hand it their data; `GlyphMarkup` draws the rest.
  import type { GlyphProps } from "./types";

  interface Props extends Omit<GlyphProps, "weight"> {
    /** Path data. */
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
  aria-hidden={hidden ?? (label ? undefined : "true")}><path d={icon} /></svg
>
