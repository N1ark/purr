/** Its own module, with no imports, so anything can read it without making an import cycle. */

export const IS_BROWSER = typeof window !== "undefined";

/** Inside a Tauri webview, rather than a plain page in a browser. */
export const IS_TAURI = IS_BROWSER && "__TAURI_INTERNALS__" in window;

/**
 * Phone-shaped: a coarse pointer on a narrow screen, not the OS, so the browser dev loop sees
 * the same thing a phone does. `?mobile` in a dev build forces it, for layout work without one.
 */
export function detectMobile(): boolean {
  if (!IS_BROWSER) return false;
  if (import.meta.env?.DEV && new URLSearchParams(location.search).has("mobile")) return true;
  return (
    typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches && innerWidth < 700
  );
}

/** Read once at startup; pass it to `applyPlatform({ mobile })` in an app that has a phone layout. */
export const isMobile = detectMobile();
