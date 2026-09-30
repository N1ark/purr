/**
 * The stack of everything covering the app. Escape closes only the topmost; a press outside
 * closes each layer it lands outside of, from the top, until one contains it. One set of
 * document listeners serves them all, installed with the first overlay.
 * Not reactive: a `$state` array pushed to and read inside an effect never settles.
 */

type Elements = () => (Element | null | undefined)[] | Element | null | undefined;

export interface OverlayOptions {
  /** What counts as inside; without it a press outside never closes this overlay. */
  element?: Elements;
  /** Also inside, e.g. the button that toggles a popover, so its own click can close it. */
  ignore?: Elements;
  /** Escape closes it (default true). */
  escape?: boolean;
  /** Closes when the world moves under it: a scroll outside, a resize, the window losing focus. */
  volatile?: boolean;
}

interface Entry extends OverlayOptions {
  id: number;
  close: () => void;
}

const stack: Entry[] = [];
let nextId = 0;
let installed = false;

function list(source: Elements | undefined): Element[] {
  const got = source?.();
  if (!got) return [];
  return (Array.isArray(got) ? got : [got]).filter((el): el is Element => !!el);
}

function contains(entry: Entry, target: Node): boolean {
  return [...list(entry.element), ...list(entry.ignore)].some((el) => el.contains(target));
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.defaultPrevented || e.isComposing) return;
  // Shift+Escape and friends are the app's own.
  if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
  for (let i = stack.length - 1; i >= 0; i--) {
    const top = stack[i];
    if (top.escape === false) continue;
    e.preventDefault();
    e.stopPropagation();
    top.close();
    return;
  }
}

function onPointerDown(e: PointerEvent) {
  const target = e.target as Node | null;
  if (!target) return;
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i];
    if (!entry.element || contains(entry, target)) return;
    entry.close();
  }
}

function closeVolatile(except?: (entry: Entry) => boolean) {
  for (const entry of [...stack].reverse()) {
    if (entry.volatile && !except?.(entry)) entry.close();
  }
}

function onScroll(e: Event) {
  const target = e.target;
  // A menu that scrolls its own long list is not the world moving.
  closeVolatile((entry) => target instanceof Node && contains(entry, target));
}

function onBlur() {
  // A native picker opened from inside blurs the window while its owner still holds focus.
  const active = document.activeElement;
  closeVolatile((entry) => !!active && active !== document.body && contains(entry, active));
}

const onResize = () => closeVolatile();

function install() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  // Bubbling, so a field deeper down that wants Escape for itself can stop it first.
  window.addEventListener("keydown", onKeydown);
  // Capturing, so a handler that stops propagation cannot keep a menu open.
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("blur", onBlur);
}

/** From an effect, which runs the returned cleanup: `$effect(() => registerOverlay(onclose))`. */
export function registerOverlay(close: () => void, options: OverlayOptions = {}): () => void {
  install();
  const id = nextId++;
  stack.push({ id, close, ...options });
  return () => {
    const at = stack.findIndex((entry) => entry.id === id);
    if (at >= 0) stack.splice(at, 1);
  };
}

/** Close the topmost overlay, if there is one. */
export function closeTopOverlay(): boolean {
  const top = stack.at(-1);
  if (!top) return false;
  top.close();
  return true;
}

/** Close everything, topmost first: a view change the overlays were about. */
export function closeAllOverlays(): void {
  for (const entry of [...stack].reverse()) entry.close();
}

/** Whether anything is currently covering the app; plain shortcuts stand aside while it is. */
export function hasOverlay(): boolean {
  return stack.length > 0;
}
