import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { memoryStorage } from "./storage";
import { ACCENTS, accentVars, applyTheme, bootTheme, currentTheme, readStoredTheme } from "./theme";

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
