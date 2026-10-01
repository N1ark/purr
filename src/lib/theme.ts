import { readString, writeJson } from "./storage";

/**
 * Only the accent group is overridden here; the palette is `styles/tokens.css`. Each accent
 * carries a light and a dark pair: a hue that reads on `#111` is too dark on white.
 */

export interface Accent {
  id: string;
  label: string;
  /** Primary and hover/secondary (`--theme`, `--theme2`) for each theme. */
  light: [string, string];
  dark: [string, string];
}

/** Checked against the palette in `theme.test.ts`: every pair keeps AA in its theme. */
export const ACCENTS: readonly Accent[] = [
  // The default, n1ark.com's purple; `tokens.css` carries the same four values.
  { id: "purple", label: "Purple", light: ["#8a2aa2", "#a33bb0"], dark: ["#8a2aa2", "#c264cf"] },
  { id: "magenta", label: "Magenta", light: ["#8d2757", "#b93d76"], dark: ["#c2447f", "#d96f9f"] },
  { id: "red", label: "Red", light: ["#8f2f2a", "#b34c46"], dark: ["#c0504a", "#d97a74"] },
  { id: "amber", label: "Amber", light: ["#8a5a12", "#906524"], dark: ["#9e6a1b", "#d19a3f"] },
  { id: "green", label: "Green", light: ["#2f6b38", "#3b7a45"], dark: ["#43824b", "#6fb178"] },
  { id: "teal", label: "Teal", light: ["#1d6360", "#297874"], dark: ["#2a817c", "#4fada8"] },
  { id: "blue", label: "Blue", light: ["#27508f", "#3a6fb5"], dark: ["#3b73c4", "#6094db"] },
  { id: "slate", label: "Slate", light: ["#4a525e", "#656e7b"], dark: ["#6b7280", "#98a1ad"] },
];

export const DEFAULT_ACCENT = "purple";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export type Density = "compact" | "cozy" | "dense";

export interface ThemeOptions {
  mode: ThemeMode;
  /** An `ACCENTS` id, or a custom pair set; omitted means the palette's own purple. */
  accent?: string | Accent;
  density?: Density;
  /**
   * Mirrors the choice here, for `bootTheme` or `themeScript` to paint from before anything else
   * runs; a page with no preferences file of its own reads it back with `storedThemeMode`.
   */
  storageKey?: string;
}

export function accentById(id: string): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

/** The accent's primary colour in a theme, for swatches in settings. */
export function accentSwatch(id: string, theme: ResolvedTheme): string {
  return accentById(id)[theme][0];
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function systemTheme(): ResolvedTheme {
  if (typeof matchMedia === "undefined") return "light";
  return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? systemTheme() : mode;
}

/** The theme the document is painted in right now. */
export function currentTheme(): ResolvedTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** The tints every accent derives from its two base colours, mirroring the ratios in `tokens.css`. */
export function accentVars(accent: Accent, theme: ResolvedTheme): Record<string, string> {
  const [primary, secondary] = accent[theme];
  const mix = (pct: number) => `color-mix(in srgb, ${primary} ${pct}%, transparent)`;
  const dark = theme === "dark";
  return {
    "--theme": primary,
    "--theme2": secondary,
    "--theme-soft": mix(dark ? 13 : 8),
    "--theme-mid": mix(dark ? 30 : 20),
    // Selection is the accent too, or a purple wash under a green accent reads as a bug.
    "--selection": mix(dark ? 35 : 18),
    "--mention": mix(dark ? 20 : 12),
  };
}

let unfollow: (() => void) | null = null;
const listeners = new Set<(theme: ResolvedTheme) => void>();

/** Told whenever the painted theme changes, a system flip included; returns an unsubscribe. */
export function onThemeChange(fn: (theme: ResolvedTheme) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function paint(options: ThemeOptions): ResolvedTheme {
  const root = document.documentElement;
  const theme = resolveTheme(options.mode);
  const before = root.classList.contains("dark") ? "dark" : "light";
  root.classList.toggle("dark", theme === "dark");

  root.classList.remove("density-cozy", "density-dense");
  if (options.density && options.density !== "compact") {
    root.classList.add(`density-${options.density}`);
  }

  const accent =
    typeof options.accent === "string" ? accentById(options.accent) : (options.accent ?? null);
  const vars = accent ? accentVars(accent, theme) : accentVars(ACCENTS[0], theme);
  for (const [name, value] of Object.entries(vars)) {
    // The default accent is the stylesheet's own: no inline override to fight a theme later.
    if (accent && accent.id !== DEFAULT_ACCENT) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  }

  if (options.storageKey) {
    const saved: StoredTheme = {
      theme,
      mode: options.mode,
      accent: accent?.id,
      density: options.density,
    };
    writeJson(options.storageKey, saved);
  }
  if (before !== theme) for (const fn of listeners) fn(theme);
  return theme;
}

/** Sets `html.dark`, the density class and the accent; `system` follows the OS until the next call. */
export function applyTheme(options: ThemeOptions): ResolvedTheme {
  unfollow?.();
  unfollow = null;
  if (options.mode === "system" && typeof matchMedia !== "undefined") {
    const query = matchMedia(DARK_QUERY);
    const follow = () => paint(options);
    query.addEventListener("change", follow);
    unfollow = () => query.removeEventListener("change", follow);
  }
  return paint(options);
}

interface StoredTheme {
  /** What it resolved to when it was written. */
  theme: ResolvedTheme;
  /** What was asked for; `system` is resolved again on every boot. */
  mode?: ThemeMode;
  accent?: string;
  density?: Density;
}

/** What `applyTheme({ storageKey })` left behind; tolerates a bare `"dark"`/`"light"` too. */
export function readStoredTheme(raw: string | null): StoredTheme | null {
  if (raw === "dark" || raw === "light") return { theme: raw };
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTheme> | null;
    if (parsed?.theme !== "dark" && parsed?.theme !== "light") return null;
    const mode = parsed.mode;
    return {
      theme: parsed.theme,
      mode: mode === "system" || mode === "light" || mode === "dark" ? mode : undefined,
      accent: typeof parsed.accent === "string" ? parsed.accent : undefined,
      density:
        parsed.density === "cozy" || parsed.density === "dense" || parsed.density === "compact"
          ? parsed.density
          : undefined,
    };
  } catch {
    return null;
  }
}

/** The mode last applied with this `storageKey`; `system` when there is none. */
export function storedThemeMode(storageKey: string): ThemeMode {
  const saved = readStoredTheme(readString(storageKey));
  return saved?.mode ?? saved?.theme ?? "system";
}

/**
 * Paints before the first frame, when the preferences file has not arrived yet: the last
 * choice from storage (`system` resolved afresh), or the system's. Call from `main.ts` before
 * mounting; a server-rendered page uses `themeScript` instead, which does the same inline.
 */
export function bootTheme(storageKey: string): ResolvedTheme {
  const saved = readStoredTheme(readString(storageKey));
  return paint({
    mode: saved?.mode ?? saved?.theme ?? "system",
    accent: saved?.accent,
    density: saved?.density,
  });
}

/**
 * The accents as `themeScript` carries them: each one's two pairs, and the tints as templates
 * (`{1}`, `{2}` for the pair) taken from `accentVars`, so the script cannot drift from it.
 */
function accentData() {
  const marked: Accent = { id: "", label: "", light: ["{1}", "{2}"], dark: ["{1}", "{2}"] };
  const pairs: Record<string, Pick<Accent, "light" | "dark">> = {};
  for (const { id, light, dark } of ACCENTS) if (id !== DEFAULT_ACCENT) pairs[id] = { light, dark };
  return { pairs, tints: { light: accentVars(marked, "light"), dark: accentVars(marked, "dark") } };
}

type AccentData = ReturnType<typeof accentData>;

// What `bootTheme` does, as a self-contained function `themeScript` writes out as source:
// it runs before any module has loaded, so it may use nothing outside itself.
function boot(key: string, accents: AccentData) {
  try {
    const root = document.documentElement;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // Storage disabled: the system's theme.
    }
    let saved: { theme?: string; mode?: string; accent?: string; density?: string } = {};
    if (raw === "dark" || raw === "light") saved = { theme: raw };
    else if (raw) saved = JSON.parse(raw) || {};
    const mode = saved.mode || saved.theme || "system";
    const dark =
      mode === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : mode === "dark";
    root.classList.toggle("dark", dark);
    if (saved.density === "cozy" || saved.density === "dense")
      root.classList.add("density-" + saved.density);
    const accent = saved.accent ? accents.pairs[saved.accent] : undefined;
    if (accent) {
      const theme = dark ? "dark" : "light";
      const [primary, secondary] = accent[theme];
      const tints: Record<string, string> = accents.tints[theme];
      for (const name in tints)
        root.style.setProperty(
          name,
          tints[name].split("{1}").join(primary).split("{2}").join(secondary),
        );
    }
  } catch {
    // Unreadable storage paints the stylesheet's default.
  }
}

/**
 * `bootTheme` as inline script source, for a server-rendered page: put it in a `<script>` in
 * the `<head>` (or render `ThemeScript`) and the first paint is already in the stored theme.
 * Reads what `applyTheme({ storageKey })` writes.
 */
export function themeScript(storageKey: string): string {
  // Escaped so the JSON can never close the `<script>` it is written into.
  const data = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
  // Indentation only: the lines stay, so a comment or a missing semicolon still ends where it did.
  const source = boot.toString().replace(/\n\s+/g, "\n");
  return `(${source})(${data(storageKey)},${data(accentData())});`;
}
