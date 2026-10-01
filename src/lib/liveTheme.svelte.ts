// The painted theme as a rune, for markup that differs by theme (a canvas palette, a toggle's
// icon). On a server it is always light: style what the first paint must get right from
// `html.dark` in CSS instead, and read this after mount.
import { IS_BROWSER } from "./env";
import { onThemeChange, type ResolvedTheme } from "./theme";

class LiveTheme {
  current = $state<ResolvedTheme>(
    IS_BROWSER && document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  get dark(): boolean {
    return this.current === "dark";
  }
}

export const liveTheme = new LiveTheme();

if (IS_BROWSER) onThemeChange((theme) => (liveTheme.current = theme));
