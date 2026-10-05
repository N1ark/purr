import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { memoryStorage } from "./storage";
import {
  ACCENTS,
  accentById,
  accentVars,
  applyTheme,
  bootTheme,
  currentTheme,
  readStoredTheme,
  storedThemeMode,
  themeScript,
} from "./theme";

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
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe(
      accentById("teal").light[0],
    );
    applyTheme({ mode: "light" });
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe("");
  });

  it("mirrors the resolved theme for the next boot to paint from", () => {
    applyTheme({ mode: "dark", accent: "green", storageKey: "t" });
    document.documentElement.className = "";
    expect(bootTheme("t")).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe(
      accentById("green").dark[0],
    );
  });
});

describe("stored mode", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
  });

  const system = (dark: boolean) =>
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: dark && q.includes("dark"),
      addEventListener() {},
      removeEventListener() {},
    }));

  it("keeps system as system, resolved afresh on the next boot", () => {
    system(false);
    applyTheme({ mode: "system", storageKey: "t" });
    expect(storedThemeMode("t")).toBe("system");
    system(true);
    expect(bootTheme("t")).toBe("dark");
  });

  it("is system when nothing was stored", () => {
    expect(storedThemeMode("none")).toBe("system");
    localStorage.setItem("old", "dark");
    expect(storedThemeMode("old")).toBe("dark");
  });
});

describe("themeScript", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
  });

  const run = (key: string) => new Function(themeScript(key))();

  it("paints what applyTheme stored, before any module loads", () => {
    applyTheme({ mode: "dark", accent: "teal", density: "cozy", storageKey: "t" });
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    run("t");
    expect(currentTheme()).toBe("dark");
    expect(document.documentElement.classList.contains("density-cozy")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--theme")).toBe(
      accentVars(
        ACCENTS.find((a) => a.id === "teal")!,
        "dark",
      )["--theme"],
    );
  });

  it("follows the system without a stored choice, and survives junk", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("dark") }));
    run("none");
    expect(currentTheme()).toBe("dark");
    localStorage.setItem("junk", "{nope");
    document.documentElement.className = "";
    run("junk");
    expect(currentTheme()).toBe("light");
  });

  it("cannot close its own script tag", () => {
    expect(themeScript("</script><b>")).not.toContain("</script>");
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
