/** From the user agent, not a Tauri command, so the browser build and screenshots behave. */

export type OsName = "macos" | "windows" | "linux" | "ios" | "android";

export function detectOs(ua: string): OsName {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macos";
  if (/Windows/i.test(ua)) return "windows";
  return "linux";
}

export const os: OsName = detectOs(typeof navigator === "undefined" ? "" : navigator.userAgent);

/** Apple keyboards: ⌘ is the modifier and shortcuts are written as glyphs. */
export const isMac = os === "macos" || os === "ios";

/** The "do the thing" modifier as words would write it: ⌘ on a Mac, Ctrl everywhere else. */
export const MOD = isMac ? "⌘" : "Ctrl";

/** Whether the phone layout is on; CSS reads `body.mobile`, code that must branch reads this. */
export function isMobileLayout(): boolean {
  return typeof document !== "undefined" && document.body.classList.contains("mobile");
}

/** Reports the keyboard's height in CSS px; returns an unsubscribe, sync or not. */
export type KeyboardSource = (
  report: (px: number) => void,
) => (() => void) | Promise<() => void> | void;

/**
 * Keeps `--kb` (how much of the screen the software keyboard covers) and `body.keyboard` current.
 * WKWebView never shrinks the visual viewport, so a native source is preferred when there is one;
 * without it the visual viewport stands in, which is right in a mobile browser.
 */
export function trackKeyboard(native?: KeyboardSource): () => void {
  const set = (px: number) => {
    const kb = Math.max(0, Math.round(px));
    document.documentElement.style.setProperty("--kb", `${kb}px`);
    document.body.classList.toggle("keyboard", kb > 0);
  };

  if (native) {
    let stop: (() => void) | null = null;
    let stopped = false;
    const got = native(set);
    if (got instanceof Promise) void got.then((fn) => (stopped ? fn() : (stop = fn)));
    else if (got) stop = got;
    return () => {
      stopped = true;
      stop?.();
      set(0);
    };
  }

  const vv = window.visualViewport;
  if (!vv) return () => {};
  const track = () => set(window.innerHeight - vv.height - vv.offsetTop);
  vv.addEventListener("resize", track);
  vv.addEventListener("scroll", track);
  track();
  return () => {
    vv.removeEventListener("resize", track);
    vv.removeEventListener("scroll", track);
    set(0);
  };
}

/** The net for the scrolls WKWebView performs on its own, in a shell where nothing scrolls. */
export function pinWindowScroll(): () => void {
  const reset = () => (window.scrollX || window.scrollY) && window.scrollTo(0, 0);
  window.addEventListener("scroll", reset, { passive: true });
  return () => window.removeEventListener("scroll", reset);
}

export interface PlatformOptions {
  /** Turns on the phone layout: `body.mobile`, the touch targets and the keyboard tracking. */
  mobile?: boolean;
  /** Where the keyboard height comes from on a phone (a Tauri event); the visual viewport otherwise. */
  keyboard?: KeyboardSource;
}

/** Call before the first paint: marks `html[data-os]` and `body.mobile`; returns a teardown. */
export function applyPlatform(options: PlatformOptions = {}): () => void {
  document.documentElement.dataset.os = os;
  const mobile = options.mobile === true;
  document.body.classList.toggle("mobile", mobile);
  if (!mobile) return () => {};
  const stopKeyboard = trackKeyboard(options.keyboard);
  const unpin = pinWindowScroll();
  return () => {
    stopKeyboard();
    unpin();
    document.body.classList.remove("mobile");
  };
}
