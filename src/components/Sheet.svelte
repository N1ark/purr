<script lang="ts">
  // The one panel a phone shows at a time: a bottom sheet with two stops — peeking
  // (`--sheet-peek` of it showing) and full (its top at `--sheet-top`) — dragged by its grabber
  // or its contents, flung to the next stop, dismissed off the bottom. Moved by a transform, so
  // the drag stays on the compositor. `--sheet-lift` and `--sheet-dim` on the root let a
  // floating bar follow it frame by frame.
  import type { Snippet } from "svelte";

  import { registerOverlay } from "../lib/overlays.svelte";

  interface Props {
    /** At the top stop rather than peeking; a field taking focus sets it. */
    full?: boolean;
    onclose: () => void;
    /** Announced to screen readers. */
    label: string;
    expandLabel?: string;
    collapseLabel?: string;
    children: Snippet;
  }

  let {
    full = $bindable(false),
    onclose,
    label,
    expandLabel = "Expand",
    collapseLabel = "Collapse",
    children,
  }: Props = $props();

  let el = $state<HTMLDivElement | null>(null);
  /** Off-screen for the first frame, so it slides up rather than appearing. */
  let entering = $state(true);
  let leaving = $state(false);
  let y = $state<number | null>(null);
  /** Mid-transition, when iOS's native caret would be left behind where the sheet was. */
  let sliding = $state(false);
  /** The three stops, read once per gesture: full, peek, and gone. */
  let stops = $state<{ top: number; peek: number; max: number } | null>(null);
  let drag: {
    pointer: number;
    y: number;
    from: number;
    engaged: boolean;
    tap: boolean;
    el: HTMLElement;
    at: number;
    lastY: number;
    v: number;
  } | null = null;

  /** Past this (px/ms), a flick decides the stop rather than where the finger let go. */
  const FLING = 0.45;
  /** How far the sheet gives above its top stop before it stops moving at all. */
  const RUBBER = 32;

  $effect(() => {
    // A frame later, so the off-screen position is painted first; the timer covers a lost frame.
    const frame = requestAnimationFrame(() => (entering = false));
    const timer = setTimeout(() => (entering = false), 100);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  });

  $effect(() => registerOverlay(() => dismiss()));

  const slide = (on: boolean) => (e: TransitionEvent) => {
    if (e.target === el && e.propertyName === "transform") sliding = on;
  };

  /** Typing needs the room: a field taking focus opens the sheet all the way. */
  function onFocusIn(e: FocusEvent) {
    const target = e.target as HTMLElement;
    if (
      target.matches("input:not([type=checkbox]):not([type=radio]), textarea, [contenteditable]")
    ) {
      full = true;
    }
  }

  /** How dimmed the screen behind is: nothing at the peek, fully at the top. */
  const dim = $derived.by(() => {
    if (entering || leaving) return 0;
    if (y === null || !stops) return full ? 1 : 0;
    const span = Math.max(1, stops.peek - stops.top);
    return Math.max(0, Math.min(1, (stops.peek - y) / span));
  });

  /** How far a floating bottom bar rides up, so it follows the sheet. */
  const lift = $derived.by(() => {
    if (entering || leaving) return 0;
    if (y === null || !stops) return null;
    return Math.max(0, Math.min(stops.max - stops.peek, stops.max - y));
  });

  $effect(() => {
    const s = document.documentElement.style;
    if (lift === null) s.setProperty("--sheet-lift", "var(--sheet-peek)");
    else s.setProperty("--sheet-lift", `${lift}px`);
    s.setProperty("--sheet-dim", `${dim}`);
    document.body.classList.toggle("sheet-dragging", y !== null);
  });

  $effect(() => () => {
    const s = document.documentElement.style;
    s.removeProperty("--sheet-lift");
    s.removeProperty("--sheet-dim");
    document.body.classList.remove("sheet-dragging");
  });

  /** Slides out before it closes, so it leaves the way it arrived. */
  export function dismiss() {
    if (leaving) return;
    leaving = true;
    y = null;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      onclose();
    };
    // Whichever comes first: the slide finishing, or the app never painting it.
    const timer = setTimeout(finish, 600);
    el?.addEventListener("transitionend", (e) => e.propertyName === "transform" && finish());
  }

  function cssPx(name: string, fallback: number) {
    const v = parseFloat(getComputedStyle(el ?? document.body).getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  }

  /** Where the sheet actually is, transition included, so a re-grab never jumps. */
  function currentY(fallback: number) {
    if (!el) return fallback;
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return Number.isFinite(m.m42) ? m.m42 : fallback;
  }

  function begin(e: PointerEvent, engaged: boolean) {
    if (!el || leaving) return;
    const max = el.getBoundingClientRect().height;
    stops = { top: cssPx("--sheet-top", 96), peek: max - cssPx("--sheet-peek", 148), max };
    const from = currentY(full ? stops.top : stops.peek);
    drag = {
      pointer: e.pointerId,
      y: e.clientY,
      from,
      engaged,
      tap: engaged,
      el: e.currentTarget as HTMLElement,
      at: e.timeStamp,
      lastY: e.clientY,
      v: 0,
    };
    // Frozen where it is: a gesture that starts mid-transition picks it up there.
    y = from;
    // Content waits for the gesture to commit: capturing early steals the tap.
    if (engaged) drag.el.setPointerCapture(e.pointerId);
  }

  function scrollableAncestor(from: HTMLElement | null): HTMLElement | null {
    for (let n = from; n && n !== el; n = n.parentElement) {
      if (n.scrollHeight > n.clientHeight + 1 && getComputedStyle(n).overflowY !== "visible")
        return n;
    }
    return null;
  }

  /** Anything but a control drags the panel; a full one only from the top of its scroll. */
  function onBodyDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, [contenteditable], .grab")) return;
    const scroller = target.closest<HTMLElement>("[data-scroll]") ?? scrollableAncestor(target);
    if (full && scroller && scroller.scrollTop > 0) return;
    begin(e, false);
  }

  // A lowered sheet's contents do not scroll: iOS starting a scroll would cancel the drag.
  $effect(() => {
    const node = el;
    if (!node) return;
    const block = (e: TouchEvent) => {
      if (drag && (drag.engaged || !full) && e.cancelable) e.preventDefault();
    };
    node.addEventListener("touchmove", block, { passive: false });
    return () => node.removeEventListener("touchmove", block);
  });

  /** Past the top stop the sheet gives a little and then stops: iOS's rubber band. */
  const resist = (over: number) => (over * RUBBER) / (over + RUBBER);

  function onMove(e: PointerEvent) {
    if (!drag || !stops || e.pointerId !== drag.pointer) return;
    const dy = e.clientY - drag.y;
    if (!drag.engaged) {
      // Upwards on a full sheet means they meant to scroll the contents; let the gesture go.
      if (full && dy < -6) {
        drag = null;
        y = null;
        return;
      }
      if (full ? dy < 8 : Math.abs(dy) < 6) return;
      drag.engaged = true;
      drag.at = e.timeStamp;
      drag.lastY = e.clientY;
      drag.el.setPointerCapture(e.pointerId);
    }
    const dt = e.timeStamp - drag.at;
    // Smoothed, so one stuttering frame at the end cannot decide the whole gesture.
    if (dt > 0) {
      drag.v = 0.7 * ((e.clientY - drag.lastY) / dt) + 0.3 * drag.v;
      drag.at = e.timeStamp;
      drag.lastY = e.clientY;
    }
    const to = drag.from + dy;
    y = to < stops.top ? stops.top - resist(stops.top - to) : Math.min(stops.max, to);
  }

  function onUp(e: PointerEvent) {
    if (!drag || !stops) return;
    const { max, top, peek } = stops;
    const at = y ?? drag.from;
    const tapped = drag.tap && Math.abs(e.clientY - drag.y) < 6;
    const { engaged } = drag;
    // A finger that came to rest before lifting was placing the sheet, not throwing it.
    const v = e.timeStamp - drag.at > 80 ? 0 : drag.v;
    drag = null;
    y = null;
    if (tapped) {
      full = !full;
      return;
    }
    // A tap on the contents is theirs, not a gesture on the panel.
    if (!engaged) return;
    const ordered = [top, peek, max];
    // A flick carries to the next stop the way it was thrown; a slow drag settles on the nearest.
    const target =
      Math.abs(v) > FLING
        ? v > 0
          ? (ordered.find((s) => s > at + 1) ?? max)
          : ([...ordered].reverse().find((s) => s < at - 1) ?? top)
        : ordered.reduce((a, b) => (Math.abs(b - at) < Math.abs(a - at) ? b : a));
    if (target === max) dismiss();
    else full = target === top;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="scrim"
  class:hit={dim > 0.05}
  class:dragging={y !== null}
  style:opacity={dim}
  onpointerdown={dismiss}
></div>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="sheet"
  class:full
  class:off={entering || leaving}
  class:dragging={y !== null}
  class:moving={y !== null || sliding}
  style:transform={y === null ? undefined : `translateY(${y}px)`}
  role="dialog"
  aria-label={label}
  tabindex="-1"
  bind:this={el}
  onpointerdown={onBodyDown}
  onfocusin={onFocusIn}
  ontransitionstart={slide(true)}
  ontransitionend={slide(false)}
  ontransitioncancel={slide(false)}
  onpointermove={onMove}
  onpointerup={onUp}
  onpointercancel={onUp}
>
  <button
    type="button"
    class="grab"
    aria-label={full ? collapseLabel : expandLabel}
    aria-expanded={full}
    onpointerdown={(e) => begin(e, true)}
    onpointermove={onMove}
    onpointerup={onUp}
    onpointercancel={onUp}
    onclick={(e) => e.detail === 0 && (full = !full)}
  ></button>
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: var(--z-sheet);
    background: var(--scrim);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--dur-sheet) var(--ease-sheet);
  }
  .scrim.hit {
    pointer-events: auto;
  }
  .scrim.dragging {
    transition: none;
  }
  .sheet {
    position: fixed;
    top: 0;
    /* Flush with the edges; the safe-area insets are only non-zero in landscape. */
    left: var(--safe-left);
    right: var(--safe-right);
    bottom: var(--kb);
    z-index: var(--z-sheet);
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: var(--shadow-lg);
    outline: none;
    /* A whole viewport tall and slid down, so its last `--sheet-top` pixels sit below the
       screen even at the top stop. */
    padding-bottom: calc(var(--safe-bottom) + var(--sheet-top));
    transform: translateY(calc(100% - var(--sheet-peek)));
    transition: transform var(--dur-sheet) var(--ease-sheet);
    will-change: transform;
    overflow: hidden;
    overscroll-behavior: contain;
  }
  .sheet.full {
    transform: translateY(var(--sheet-top));
  }
  .sheet.off,
  .sheet.off.full {
    transform: translateY(100%);
  }
  .sheet.dragging {
    transition: none;
  }
  .sheet.moving :global(:is(input, textarea)) {
    caret-color: transparent;
  }
  :global(body.keyboard) .sheet {
    padding-bottom: var(--sheet-top);
  }
  /* Whatever is inside fills what is left, and starts at the top. */
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .content > :global(*) {
    flex: 1;
    min-height: 0;
  }
  .grab {
    display: block;
    flex: none;
    align-self: center;
    width: 44px;
    height: 20px;
    touch-action: none;
  }
  .grab::before {
    content: "";
    display: block;
    width: 36px;
    height: 4px;
    margin: var(--sp-4) auto var(--sp-2);
    border-radius: var(--radius-pill);
    background: var(--border-strong);
  }
</style>
