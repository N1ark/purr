import type { IconWeight } from "phosphor-svelte";
import type { ComponentInternals } from "svelte";
import Glyph from "../components/Glyph.svelte";
import GlyphMarkup from "../components/GlyphMarkup.svelte";
import type { GlyphComponent, GlyphProps } from "../components/types";

type Weights = Partial<Record<IconWeight, string>>;

/**
 * A light icon from its shapes at one weight or more: path data, or SVG markup for an icon of
 * several (never user content). It draws the weight asked for, else regular, else the one it
 * has. `purr/glyphs` is made of these; an app can make its own.
 */
export function glyph(data: Weights): GlyphComponent {
  if (Object.values(data).every((d) => d[0] !== "<")) return pathGlyph(data);
  const markup: Weights = {};
  for (const [w, d] of Object.entries(data) as [IconWeight, string][])
    markup[w] = d[0] === "<" ? d : `<path d="${d}"/>`;
  return render(GlyphMarkup, markup);
}

/** `glyph()` for path data alone, which leaves the markup renderer out of a build that needs none. */
export function pathGlyph(data: Weights): GlyphComponent {
  return render(Glyph, data);
}

function render(Render: typeof Glyph, weights: Weights): GlyphComponent {
  const fallback = weights.regular ?? Object.values(weights)[0] ?? "";
  // A component is a function: this one hands its props on, with the data for its weight.
  return (internals: ComponentInternals, props: GlyphProps) =>
    Render(internals, {
      get icon() {
        return (props.weight && weights[props.weight]) || fallback;
      },
      get size() {
        return props.size;
      },
      get color() {
        return props.color;
      },
      get mirrored() {
        return props.mirrored;
      },
      get class() {
        return props.class;
      },
      get "aria-label"() {
        return props["aria-label"];
      },
      get "aria-hidden"() {
        return props["aria-hidden"];
      },
    });
}
