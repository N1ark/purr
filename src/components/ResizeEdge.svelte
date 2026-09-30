<script lang="ts">
  // The draggable border of a resizable pane, inside the pane (which is `position: relative`).
  // Drag it, or focus it and use the arrows; a double-click or Enter restores `preset`.
  import { resizer, type ResizeSide } from "../actions/resize";

  interface Props {
    /** The pane's current width (or height, for `top`/`bottom`) in px. */
    size: number;
    /** Which side of the layout the pane is on; the edge is on its opposite side. */
    side: ResizeSide;
    /** Names the separator to a screen reader: "Resize sidebar". */
    label: string;
    min?: number;
    max?: number;
    preset?: number;
    onresize: (size: number) => void;
    /** When a drag settles: persist it here. */
    oncommit?: (size: number) => void;
  }

  const { size, side, label, min, max, preset, onresize, oncommit }: Props = $props();

  const vertical = $derived(side === "top" || side === "bottom");
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="edge edge-{side}"
  role="separator"
  aria-orientation={vertical ? "horizontal" : "vertical"}
  aria-label={label}
  aria-valuenow={size}
  aria-valuemin={min}
  aria-valuemax={max}
  tabindex="0"
  use:resizer={{ size, side, min, max, preset, onresize, oncommit }}
></div>

<style>
  .edge {
    position: absolute;
    z-index: var(--z-resize);
    touch-action: none;
    transition: background-color var(--dur) var(--ease);
  }
  .edge-left,
  .edge-right {
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
  }
  /* A pane on the left is dragged by its right edge, and so on round. */
  .edge-left {
    right: -3px;
  }
  .edge-right {
    left: -3px;
  }
  .edge-top,
  .edge-bottom {
    left: 0;
    right: 0;
    height: 6px;
    cursor: row-resize;
  }
  .edge-top {
    bottom: -3px;
  }
  .edge-bottom {
    top: -3px;
  }
  .edge:focus-visible,
  .edge:global(.resizing) {
    background: var(--theme-soft);
    outline: none;
  }
  @media (hover: hover) {
    .edge:hover {
      background: var(--theme-soft);
    }
  }
  :global(body.resizing-x) {
    cursor: col-resize;
  }
  :global(body.resizing-y) {
    cursor: row-resize;
  }
</style>
