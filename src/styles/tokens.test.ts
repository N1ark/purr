// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { AA_NON_TEXT, AA_TEXT, contrastRatio } from "../lib/color";
import { ACCENTS, type ResolvedTheme } from "../lib/theme";

// Read rather than imported: Vite hands a stylesheet to a test as an empty module, and the
// point is to check the tokens that ship.
const css = readFileSync("src/styles/tokens.css", "utf8");

function tokens(selector: string): Record<string, string> {
  const block = new RegExp(`(?:^|\\n)${selector}\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`no ${selector} block in tokens.css`);
  const found: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    found[name] = value.trim();
  }
  return found;
}

const PALETTE: Record<ResolvedTheme, Record<string, string>> = {
  light: tokens(":root"),
  dark: tokens("html\\.dark"),
};

const THEMES: ResolvedTheme[] = ["light", "dark"];

/** The busiest surface text sits on: a hovered row, darkest in light and lightest in dark. */
const surface = (theme: ResolvedTheme) => PALETTE[theme]["--bg3"];

describe.each(THEMES)("the %s palette", (theme) => {
  const palette = PALETTE[theme];

  it.each(["--color", "--color2", "--muted", "--danger", "--success", "--warn", "--info"])(
    "reads %s as text against a hovered row",
    (token) => {
      expect(contrastRatio(palette[token], surface(theme))).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it("keeps the star mark visible", () => {
    expect(contrastRatio(palette["--star"], surface(theme))).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  it("keeps presence dots apart from the panel behind them", () => {
    for (const token of ["--success", "--warn"]) {
      expect(contrastRatio(palette[token], palette["--bg2"])).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });

  it("carries readable text on a danger fill", () => {
    expect(contrastRatio(palette["--on-danger"], palette["--danger"])).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it("matches the default accent's pair", () => {
    expect([palette["--theme"], palette["--theme2"]]).toEqual(ACCENTS[0][theme]);
  });
});

// Every accent replaces `--theme` and `--theme2`, so the palette above only proves the default.
describe.each(ACCENTS)("the $label accent", (accent) => {
  it.each(THEMES)("reads as text on %s", (theme) => {
    expect(contrastRatio(accent[theme][1], surface(theme))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(THEMES)("carries text on a filled button on %s", (theme) => {
    expect(contrastRatio(PALETTE[theme]["--on-accent"], accent[theme][0])).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it.each(THEMES)("carries text on a hovered filled button on %s", (theme) => {
    expect(contrastRatio(PALETTE[theme]["--on-accent2"], accent[theme][1])).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  it.each(THEMES)("shows a mark in the accent against the page on %s", (theme) => {
    expect(contrastRatio(accent[theme][0], PALETTE[theme]["--bg"])).toBeGreaterThanOrEqual(
      AA_NON_TEXT,
    );
  });
});
