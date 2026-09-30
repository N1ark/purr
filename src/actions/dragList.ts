/**
 * Drag to reorder, delegated from the container: a list marks its rows `data-dnd-index`, a drop
 * target that is not part of the ordering `data-dnd-target`, a second ordering in the same list
 * `data-dnd-kind`, and a grip `data-dnd-handle`. The marks are styled in `overlays.css`.
 */

export interface DragListParams {
  /** Keeps lists apart: a drag is only accepted by a list of its own group. */
  group: string;
  /** Reorder within this list: `to` is the index after removal. `kind` is the row's `data-dnd-kind`. */
  onreorder?: (from: number, to: number, kind: string) => void;
  /** Drop an item onto a labelled target (e.g. a folder). */
  ondropon?: (from: number, target: string) => void;
  /** Lists nest, so without a handle dragging inside a section picks the section up. */
  handle?: boolean;
  disabled?: boolean;
}

/** `dataTransfer` cannot be read during `dragover`, so the source is remembered here. */
let active: { group: string; index: number; kind: string } | null = null;

/**
 * `dragstart` reports the draggable element, not the node under the pointer, so a grip
 * can only be recognised from the pointerdown before it. Shared: one gesture at a time.
 */
let startedOnHandle = false;

/** Marks a container managed by the action, so nested lists can tell apart. */
const ROOT = "data-dnd-root";
const ROOT_SELECTOR = `[${ROOT}]`;

const OVER_BEFORE = "dnd-before";
const OVER_AFTER = "dnd-after";
const OVER_TARGET = "dnd-target-over";
const DRAGGING = "dnd-dragging";

/** Lists nest, so a plain `contains` would have the outer list claim the inner one's rows. */
export function ownsRow(node: HTMLElement, row: HTMLElement): boolean {
  if (row === node || !node.contains(row)) return false;
  return row.parentElement?.closest(ROOT_SELECTOR) === node;
}

/**
 * The nearest `[data-dnd-index]` may be a nested list's row, which this list cannot drop
 * on; `kind` narrows it further to one of the list's own orderings.
 */
export function ownedRow(node: HTMLElement, el: HTMLElement | null, kind = ""): HTMLElement | null {
  let row = el?.closest<HTMLElement>("[data-dnd-index]") ?? null;
  while (row && !(ownsRow(node, row) && kindOf(row) === kind)) {
    row = row.parentElement?.closest<HTMLElement>("[data-dnd-index]") ?? null;
  }
  return row;
}

/** Which ordering a row belongs to. Unmarked rows are the list's ordinary ones. */
export function kindOf(row: HTMLElement): string {
  return row.dataset.dndKind ?? "";
}

/** Splicing removes the source before inserting, so a destination after it shifts down one. */
export function dropIndex(from: number, over: number, after: boolean): number {
  const destination = after ? over + 1 : over;
  return from < destination ? destination - 1 : destination;
}

/** Did this mutation add or remove a row, as opposed to repainting one? */
function touchesRow(record: MutationRecord): boolean {
  for (const nodes of [record.addedNodes, record.removedNodes]) {
    for (const n of Array.from(nodes)) {
      if (!(n instanceof Element)) continue;
      if (n.matches("[data-dnd-index]") || n.querySelector("[data-dnd-index]")) {
        return true;
      }
    }
  }
  return false;
}

export function dragList(node: HTMLElement, params: DragListParams) {
  let current = params;

  const rows = () =>
    Array.from(node.querySelectorAll<HTMLElement>("[data-dnd-index]")).filter((row) =>
      ownsRow(node, row),
    );

  // Only ever one: `dragover` fires ~60 times a second, and a subtree query per event
  // would be the whole cost of a hover.
  let marked: Element | null = null;

  function clearMarks() {
    marked?.classList.remove(OVER_BEFORE, OVER_AFTER, OVER_TARGET);
    marked = null;
  }

  function mark(el: Element, className: string) {
    clearMarks();
    el.classList.add(className);
    marked = el;
  }

  function indexOf(el: HTMLElement | null): number | null {
    const value = el?.dataset.dndIndex;
    return value === undefined ? null : Number(value);
  }

  /**
   * Over the other kind's rows, a named drag means the heading that region sits under;
   * only reached off its own kind, so an ordinary channel drag never pays for the scan.
   */
  function hoveredRow(el: HTMLElement | null, kind: string, y: number) {
    const row = ownedRow(node, el, kind);
    if (row || !kind) return row;
    let best: HTMLElement | null = null;
    for (const candidate of rows()) {
      if (kindOf(candidate) !== kind) continue;
      if (candidate.getBoundingClientRect().top <= y) best = candidate;
    }
    return best;
  }

  function onDragStart(e: DragEvent) {
    if (current.disabled) return;
    // A nested list starts its drag first; the outer one must not clobber it.
    if (active) return;

    const target = e.target as HTMLElement | null;
    const row = target?.closest<HTMLElement>("[data-dnd-index]") ?? null;
    const index = indexOf(row);
    if (!row || index === null || !ownsRow(node, row)) return;
    const kind = kindOf(row);

    // WebKit reads `draggable` before the event reaches us, so the row stays draggable and
    // the drag is refused here instead. Consumed: one pointerdown arms one dragstart.
    const onHandle = startedOnHandle;
    startedOnHandle = false;
    if (current.handle && !onHandle) {
      e.preventDefault();
      return;
    }

    active = { group: current.group, index, kind };
    row.classList.add(DRAGGING);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // Firefox refuses to start a drag without some payload set.
      e.dataTransfer.setData("text/plain", String(index));
    }
  }

  function onDragOver(e: DragEvent) {
    if (current.disabled || active?.group !== current.group) return;

    const el = e.target as HTMLElement | null;
    const kind = active.kind;
    const target = kind ? null : (el?.closest<HTMLElement>("[data-dnd-target]") ?? null);
    const row = hoveredRow(el, kind, e.clientY);

    // A labelled target wins; a folder dragged onto one is filing nothing, so it falls through.
    if (target && node.contains(target) && current.ondropon) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      mark(target, OVER_TARGET);
      return;
    }

    if (!row || !current.onreorder) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

    const box = row.getBoundingClientRect();
    const after = e.clientY > box.top + box.height / 2;
    mark(row, after ? OVER_AFTER : OVER_BEFORE);
  }

  function onDrop(e: DragEvent) {
    if (current.disabled || active?.group !== current.group) return;

    const el = e.target as HTMLElement | null;
    const kind = active.kind;
    const target = kind ? null : (el?.closest<HTMLElement>("[data-dnd-target]") ?? null);
    const row = hoveredRow(el, kind, e.clientY);
    const from = active.index;

    if (target && node.contains(target) && current.ondropon) {
      e.preventDefault();
      const name = target.dataset.dndTarget ?? "";
      clearMarks();
      active = null;
      current.ondropon(from, name);
      return;
    }

    const to = indexOf(row);
    clearMarks();
    if (!row || to === null || !current.onreorder) {
      active = null;
      return;
    }
    e.preventDefault();

    const box = row.getBoundingClientRect();
    const after = e.clientY > box.top + box.height / 2;
    const destination = dropIndex(from, to, after);

    active = null;
    if (destination !== from) current.onreorder(from, destination, kind);
  }

  function onDragEnd() {
    active = null;
    startedOnHandle = false;
    clearMarks();
    for (const el of node.querySelectorAll(`.${DRAGGING}`)) {
      el.classList.remove(DRAGGING);
    }
  }

  function onPointerDown(e: PointerEvent) {
    startedOnHandle = !!(e.target as HTMLElement | null)?.closest("[data-dnd-handle]");
  }

  function sync() {
    for (const row of rows()) {
      row.draggable = !current.disabled;
    }
  }

  node.setAttribute(ROOT, params.group);

  node.addEventListener("pointerdown", onPointerDown, true);
  node.addEventListener("dragstart", onDragStart);
  node.addEventListener("dragover", onDragOver);
  node.addEventListener("drop", onDrop);
  node.addEventListener("dragend", onDragEnd);
  node.addEventListener("dragleave", clearMarks);

  // The sidebar mutates constantly for reasons that are not rows, so only a mutation that
  // adds or removes one is worth a rescan, and a burst of them is worth exactly one.
  let queued = 0;
  const observer = new MutationObserver((records) => {
    if (queued || !records.some(touchesRow)) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      sync();
    });
  });
  observer.observe(node, { childList: true, subtree: true });
  sync();

  return {
    update(next: DragListParams) {
      current = next;
      sync();
    },
    destroy() {
      observer.disconnect();
      if (queued) cancelAnimationFrame(queued);
      node.removeAttribute(ROOT);
      node.removeEventListener("pointerdown", onPointerDown, true);
      node.removeEventListener("dragstart", onDragStart);
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("drop", onDrop);
      node.removeEventListener("dragend", onDragEnd);
      node.removeEventListener("dragleave", clearMarks);
    },
  };
}
