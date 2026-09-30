import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AA_NON_TEXT, AA_TEXT, contrastRatio } from "./color";
import { memoryStorage } from "./storage";
import {
  ACCENTS,
  accentVars,
  applyTheme,
  bootTheme,
  currentTheme,
  readStoredTheme,
  type ResolvedTheme,
} from "./theme";

/** The surfaces from `tokens.css` an accent has to read against. */
const SURFACE: Record<
  ResolvedTheme,
  { bg: string; bg3: string; onAccent: string; onAccent2: string }
> = {
  light: { bg: "#fff", bg3: "#f2f2f2", onAccent: "#fff", onAccent2: "#fff" },
  dark: { bg: "#111", bg3: "#1d1d1d", onAccent: "#fff", onAccent2: "#111" },
};

describe.each(ACCENTS)("the $label accent", (accent) => {
  it.each(["light", "dark"] as const)("keeps AA in the %s theme", (theme) => {
    const [primary, secondary] = accent[theme];
    const s = SURFACE[theme];
    // `--theme2` is link and highlight text over the hovered row.
    expect(contrastRatio(secondary, s.bg3)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(s.onAccent, primary)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(s.onAccent2, secondary)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(primary, s.bg)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

describe("accentVars", () => {
  it("derives every tint from the two base colours", () => {
    const vars = accentVars(ACCENTS[1], "dark");
    expect(vars["--theme"]).toBe(ACCENTS[1].dark[0]);
    expect(vars["--theme2"]).toBe(ACCENTS[1].dark[1]);
    expect(vars["--selection"]).toContain(ACCENTS[1].dark[0]);
  });
});

describe("applyTheme", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
  });

  it("toggles html.dark and the density class", () => {
    expect(applyTheme({ mode: "dark", density: "cozy" })).toBe("dark");
    expect(currentTheme()).toBe("dark");
    expect(document.documentElement.classList.contains("density-cozy")).toBe(true);
    applyTheme({ mode: "light", density: "compact" });
    expect(currentTheme()).toBe("light");
    expect(document.documentElement.classList.contains("density-cozy")).toBe(false);
  });

  it("leaves the stylesheet's own accent alone and overrides any other", () => {
    applyTheme({ mode: "light", accent: "purple" });
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe("");
    applyTheme({ mode: "light", accent: "teal" });
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe("#1d6360");
    applyTheme({ mode: "light" });
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe("");
  });

  it("mirrors the resolved theme for the next boot to paint from", () => {
    applyTheme({ mode: "dark", accent: "green", storageKey: "t" });
    document.documentElement.className = "";
    expect(bootTheme("t")).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe("#43824b");
  });
});

describe("readStoredTheme", () => {
  it("reads the bare strings an older build wrote", () => {
    expect(readStoredTheme("dark")).toEqual({ theme: "dark" });
  });

  it("drops what it cannot read", () => {
    expect(readStoredTheme("{nope")).toBeNull();
    expect(readStoredTheme('{"theme":"sepia"}')).toBeNull();
    expect(readStoredTheme(null)).toBeNull();
  });
});
