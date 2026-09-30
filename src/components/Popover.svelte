<script lang="ts">
  // A floating card hung off an element or opened at a point: placed once on open (flipping to
  // the side with room, then sliding to stay on screen), closed through the overlay stack by
  // Escape or a press outside, focus given back on close. `role="menu"` walks with the arrows.
  import type { Snippet } from "svelte";

  import { focusables, rememberFocus } from "../actions/focus";
  import { registerOverlay } from "../lib/overlays.svelte";
  import { place, toRect, type Placement, type Point, type Rect } from "../lib/position";

  interface Props {
    /** What it hangs off: an element (a button), a rect, or a point (a right-click). */
    anchor: HTMLElement | DOMRect | Rect | Point;
    /** `"point"` for a point, `"bottom-start"` for anything else, unless given. */
    placement?: Placement;
    /** Gap from the anchor. */
    offset?: number;
    /** Closest it comes to the window's edge. */
    margin?: number;
    onclose: () => void;
    /** Announced to screen readers; a visible heading belongs in `children`. */
    label: string;
    role?: "dialog" | "menu" | "listbox";
    /** Menus sit above cards, because cards open them. */
    layer?: "popover" | "card" | "menu";
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    padding?: string;
    /** Focus the first entry (a menu), the `[data-autofocus]` or first field, or the card. */
    autofocus?: boolean;
    /** Close when the world moves under it: a scroll outside, a resize, the window blurring. */
    volatile?: boolean;
    /** Arrows, Home and End move between `[role^=menuitem]`/`[role=option]` entries. */
    walk?: boolean;
    onkeydown?: (e: KeyboardEvent) => void;
    class?: string;
    /** The card, for a caller that needs to measure or query it. */
    element?: HTMLElement | null;
    children: Snippet;
  }

  let {
    anchor,
    placement,
    offset = 4,
    margin = 8,
    onclose,
    label,
    role = "dialog",
    layer = "popover",
    width,
    minWidth,
    maxWidth,
    maxHeight,
    padding,
    autofocus = false,
    volatile = false,
    walk,
    onkeydown,
    class: extra,
    element = $bindable(null),
    children,
  }: Props = $props();

  let card = $state<HTMLElement | null>(null);
  let at = $state<{ x: number; y: number } | null>(null);

  const isElement = (a: unknown): a is HTMLElement =>
    typeof HTMLElement !== "undefined" && a instanceof HTMLElement;

  $effect(() => {
    element = card;
  });

  $effect(() =>
    registerOverlay(() => onclose(), {
      element: () => card,
      ignore: () => (isElement(anchor) ? anchor : null),
      volatile,
    }),
  );

  // Placed once: the anchor is read when it opens, and a later resize of the card slides it
  // along the side it chose rather than flipping it back and forth.
  $effect(() => {
    const node = card;
    if (!node) return;
    const rect = toRect(anchor);
    const wanted = placement ?? (rect.width || rect.height ? "bottom-start" : "point");
    let held: Placement | null = null;
    const measure = () => {
      const size = { width: node.offsetWidth, height: node.offsetHeight };
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const placed = place(rect, size, viewport, {
        placement: held ?? wanted,
        offset,
        margin,
        flip: held === null,
      });
      held = placed.placement;
      at = { x: placed.x, y: placed.y };
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  });

  $effect(() => rememberFocus());

  const ITEMS =
    '[role^="menuitem"]:not([aria-disabled="true"]), [role="option"]:not([aria-disabled="true"])';
  const entries = () => [...(card?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];

  $effect(() => {
    if (!autofocus) return;
    const frame = requestAnimationFrame(() => {
      if (!card) return;
      // The first entry rather than the card: a reader that lands on the card is told a menu
      // opened and nothing about what is in it.
      const target =
        (role === "dialog" ? null : entries()[0]) ??
        card.querySelector<HTMLElement>("[data-autofocus]") ??
        (role === "dialog"
          ? focusables(card).find((el) => el.matches("input, textarea, select"))
          : null) ??
        card;
      target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  });

  function onKey(e: KeyboardEvent) {
    onkeydown?.(e);
    if (e.defaultPrevented || !(walk ?? role !== "dialog")) return;
    const step = ({ ArrowDown: 1, ArrowUp: -1, Home: 0, End: 0 } as Record<string, number>)[e.key];
    if (step === undefined) return;
    const all = entries();
    if (!all.length) return;
    e.preventDefault();
    const now = all.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? all.length - 1
          : now < 0
            ? step > 0
              ? 0
              : all.length - 1
            : (now + step + all.length) % all.length;
    all[next].focus();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class={["popover surface", `layer-${layer}`, extra]}
  class:placed={at !== null}
  {role}
  aria-label={label}
  tabindex="-1"
  bind:this={card}
  onkeydown={onKey}
  oncontextmenu={(e) => e.preventDefault()}
  style:left="{at?.x ?? 0}px"
  style:top="{at?.y ?? 0}px"
  style:width
  style:min-width={minWidth}
  style:max-width={maxWidth}
  style:max-height={maxHeight}
  style:padding
>
  {@render children()}
</div>

<style>
  .popover {
    position: fixed;
    z-index: var(--z-popover);
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
    overflow: auto;
    outline: none;
    box-shadow: var(--shadow-lg);
    /* Measured before it is shown, so it never flashes at the corner. */
    visibility: hidden;
  }
  .popover.placed {
    visibility: visible;
    animation: pop-in var(--dur) var(--ease);
  }
  .layer-card {
    z-index: var(--z-card);
  }
  .layer-menu {
    z-index: var(--z-menu);
  }
  @keyframes pop-in {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
  }
</style>
