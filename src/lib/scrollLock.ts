/**
 * Holds the page still under a modal: in a document that scrolls, the wheel would otherwise move
 * the page behind the scrim. Counted, so stacked modals release it once, with the last one.
 * In an app's shell, where the document never scrolls, it changes nothing.
 */

let locks = 0;
let saved: { overflow: string; gutter: string } | null = null;

export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  const root = document.documentElement;
  if (locks++ === 0) {
    saved = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    // A classic scrollbar keeps its room, so the page does not shift sideways as it goes.
    if (root.scrollHeight > root.clientHeight) root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks > 0 || !saved) return;
    root.style.overflow = saved.overflow;
    root.style.scrollbarGutter = saved.gutter;
    saved = null;
  };
}
