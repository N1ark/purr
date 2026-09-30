/**
 * The drag behind a resizable pane's edge. An action, not a component, so the pointer capture that
 * survives leaving the strip is shared; `ResizeEdge` is the usual way in.
 */

import type { Action } from "svelte/action";

import { clamp } from "../lib/util";

/** Which way the pane grows: a pane on the left grows as its right edge is dragged right. */
export type ResizeSide = "left" | "right" | "top" | "bottom";

export interface ResizeBounds {
  side: ResizeSide;
  min?: number;
  max?: number;
}

/** Narrow enough to still be a sidebar, wide enough to read a name in it. */
export const DEFAULT_MIN = 140;
export const DEFAULT_MAX = 520;

/** The pure part, so which way a pane grows is tested without a pointer. */
export function draggedSize(start: number, delta: number, bounds: ResizeBounds): number {
  // A pane on the right (or at the bottom) grows as the pointer moves left (or up).
  const grows = bounds.side === "left" || bounds.side === "top" ? delta : -delta;
  return clamp(Math.round(start + grows), bounds.min ?? DEFAULT_MIN, bounds.max ?? DEFAULT_MAX);
}

export interface ResizeParams extends ResizeBounds {
  /** The current size in px. */
  size: number;
  /** Where a double-click (or Enter) puts it back. */
  preset?: number;
  /** Arrow-key step in px; Shift takes five. */
  step?: number;
  onresize: (size: number) => void;
  /** When a drag or a key press settles, for persisting the result. */
  oncommit?: (size: number) => void;
}

export const resizer: Action<HTMLElement, ResizeParams> = (node, params) => {
  let current = params;
  let origin = 0;
  let startSize = 0;
  let latest = 0;
  const vertical = () => current.side === "top" || current.side === "bottom";
  const coord = (e: PointerEvent) => (vertical() ? e.clientY : e.clientX);

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    origin = coord(e);
    startSize = current.size;
    latest = current.size;
    node.setPointerCapture(e.pointerId);
    node.classList.add("resizing");
    document.body.classList.add(vertical() ? "resizing-y" : "resizing-x");
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", onPointerUp, { once: true });
    node.addEventListener("pointercancel", onPointerUp, { once: true });
  }

  function onPointerMove(e: PointerEvent) {
    const next = draggedSize(startSize, coord(e) - origin, current);
    if (next === latest) return;
    latest = next;
    current.onresize(latest);
  }

  function onPointerUp(e: PointerEvent) {
    if (node.hasPointerCapture(e.pointerId)) node.releasePointerCapture(e.pointerId);
    node.classList.remove("resizing");
    document.body.classList.remove("resizing-x", "resizing-y");
    node.removeEventListener("pointermove", onPointerMove);
    current.oncommit?.(latest);
  }

  function reset() {
    if (current.preset === undefined) return;
    const back = draggedSize(current.preset, 0, current);
    current.onresize(back);
    current.oncommit?.(back);
  }

  /** The keyboard's way to the same place: the arrows grow and shrink it, Home and End go to the ends. */
  function onKeydown(e: KeyboardEvent) {
    const step = (current.step ?? 10) * (e.shiftKey ? 5 : 1);
    const grow = { left: "ArrowRight", right: "ArrowLeft", top: "ArrowDown", bottom: "ArrowUp" }[
      current.side
    ];
    const shrink = { left: "ArrowLeft", right: "ArrowRight", top: "ArrowUp", bottom: "ArrowDown" }[
      current.side
    ];
    const bounds = { ...current, side: "left" as const };
    let next: number | null = null;
    if (e.key === grow) next = draggedSize(current.size, step, bounds);
    else if (e.key === shrink) next = draggedSize(current.size, -step, bounds);
    else if (e.key === "Home") next = draggedSize(-Infinity, 0, bounds);
    else if (e.key === "End") next = draggedSize(Infinity, 0, bounds);
    else if (e.key === "Enter") {
      e.preventDefault();
      reset();
      return;
    }
    if (next === null) return;
    e.preventDefault();
    current.onresize(next);
    current.oncommit?.(next);
  }

  node.addEventListener("pointerdown", onPointerDown);
  node.addEventListener("dblclick", reset);
  node.addEventListener("keydown", onKeydown);

  return {
    update(next: ResizeParams) {
      current = next;
    },
    destroy() {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("dblclick", reset);
      node.removeEventListener("keydown", onKeydown);
      node.removeEventListener("pointermove", onPointerMove);
    },
  };
};
