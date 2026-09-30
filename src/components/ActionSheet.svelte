<script lang="ts">
  // A phone's menu: rises off the bottom edge over a dimmed screen, and goes back down the way it
  // came — dragged or flicked by its grabber, a tap on the scrim, or `dismiss()`.
  import type { Snippet } from "svelte";

  import { rememberFocus } from "../actions/focus";
  import { registerOverlay } from "../lib/overlays.svelte";

  interface Props {
    onclose: () => void;
    /** Announced to screen readers. */
    label: string;
    /** The grabber's accessible name. */
    dismissLabel?: string;
    role?: "menu" | "dialog";
    onkeydown?: (e: KeyboardEvent) => void;
    /** The panel, for a caller that walks its entries. */
    element?: HTMLElement | null;
    children: Snippet;
  }

  let {
    onclose,
    label,
    dismissLabel = "Dismiss",
    role = "menu",
    onkeydown,
    element = $bindable(null),
    children,
  }: Props = $props();

  let panel = $state<HTMLElement | null>(null);
  let shown = $state(false);
  let leaving = false;
  let dragY = $state<number | null>(null);
  let grab: { y: number; last: number; at: number; v: number } | null = null;

  $effect(() => {
    element = panel;
  });

  // A frame later, so the off-screen position is painted first and it slides rather than appears.
  $effect(() => {
    const frame = requestAnimationFrame(() => (shown = true));
    return () => cancelAnimationFrame(frame);
  });

  $effect(() => registerOverlay(() => dismiss()));
  $effect(() => rememberFocus());

  /** Slides down, then closes; whichever comes first, the slide ending or a lost frame. */
  export function dismiss() {
    if (leaving) return;
    leaving = true;
    shown = false;
    dragY = null;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      onclose();
    };
    const timer = setTimeout(finish, 600);
    panel?.addEventListener("transitionend", (e) => e.propertyName === "transform" && finish());
  }

  /** Past this (px/ms), a flick decides rather than how far it went. */
  const FLING = 0.45;

  function onGrabDown(e: PointerEvent) {
    grab = { y: e.clientY, last: e.clientY, at: e.timeStamp, v: 0 };
    dragY = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onGrabMove(e: PointerEvent) {
    if (!grab) return;
    const dt = e.timeStamp - grab.at;
    // Smoothed, so one stuttering frame at the end cannot decide the gesture.
    if (dt > 0) {
      grab.v = 0.7 * ((e.clientY - grab.last) / dt) + 0.3 * grab.v;
      grab.at = e.timeStamp;
      grab.last = e.clientY;
    }
    dragY = Math.max(0, e.clientY - grab.y);
  }

  function onGrabUp(e: PointerEvent) {
    if (!grab) return;
    const flicked = grab.v > FLING && e.timeStamp - grab.at < 80;
    const far = (dragY ?? 0) > (panel?.offsetHeight ?? 200) * 0.3;
    grab = null;
    if (flicked || far) dismiss();
    else dragY = null;
  }
</script>

<button
  type="button"
  class="scrim"
  class:shown
  tabindex="-1"
  aria-label={dismissLabel}
  onclick={dismiss}
></button>
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="sheet surface"
  class:shown
  class:dragging={dragY !== null}
  style:transform={dragY !== null ? `translateY(${dragY}px)` : undefined}
  {role}
  aria-label={label}
  tabindex="-1"
  bind:this={panel}
  {onkeydown}
  oncontextmenu={(e) => e.preventDefault()}
>
  <button
    type="button"
    class="grab"
    aria-label={dismissLabel}
    onpointerdown={onGrabDown}
    onpointermove={onGrabMove}
    onpointerup={onGrabUp}
    onpointercancel={onGrabUp}
    onclick={(e) => e.detail === 0 && dismiss()}
  ></button>
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: var(--z-menu);
    background: var(--scrim);
    cursor: default;
    opacity: 0;
    transition: opacity var(--dur-sheet) var(--ease-sheet);
  }
  .scrim.shown {
    opacity: 1;
  }
  .sheet {
    position: fixed;
    left: var(--safe-left);
    right: var(--safe-right);
    bottom: 0;
    z-index: var(--z-menu);
    display: flex;
    flex-direction: column;
    max-height: 70vh;
    padding: 0 var(--sp-2) calc(var(--safe-bottom) + var(--sp-4));
    border-bottom: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: var(--shadow-lg);
    outline: none;
    transform: translateY(100%);
    transition: transform var(--dur-sheet) var(--ease-sheet);
    will-change: transform;
  }
  .sheet.shown {
    transform: translateY(0);
  }
  .sheet.dragging {
    transition: none;
  }
  .content {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
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
