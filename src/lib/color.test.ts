import { describe, expect, it } from "vitest";

import {
  AA_TEXT,
  colorFromSeed,
  contrastRatio,
  hashString,
  initials,
  parseColor,
  readableOn,
  toHex,
} from "./color";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#451551", "#451551")).toBeCloseTo(1, 5);
  });

  it("reads hex shorthand, full hex, hex with alpha and hsl() alike", () => {
    expect(parseColor("#fff")).toEqual([255, 255, 255]);
    expect(parseColor("#ffffff80")).toEqual([255, 255, 255]);
    expect(toHex(parseColor("hsl(0 100% 50%)"))).toBe("#ff0000");
    expect(toHex(parseColor("hsl(120, 100%, 25%)"))).toBe("#008000");
  });

  it("refuses a colour it cannot read rather than scoring it", () => {
    expect(() => parseColor("rebeccapurple")).toThrow();
  });
});

describe("readableOn", () => {
  it("puts dark text on a pale fill and light text on a deep one", () => {
    expect(readableOn("#f5e663")).toBe("#111");
    expect(readableOn("#451551")).toBe("#fff");
  });
});

describe("colorFromSeed", () => {
  it("is deterministic", () => {
    expect(colorFromSeed(42)).toBe(colorFromSeed(42));
    expect(colorFromSeed(hashString("a@b.c"))).toBe(colorFromSeed(hashString("a@b.c")));
  });

  it("carries white initials at AA on every hue", () => {
    for (let seed = 0; seed < 360; seed++) {
      expect(contrastRatio("#fff", colorFromSeed(seed))).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});

describe("initials", () => {
  it("takes the first and last word", () => {
    expect(initials("Ada King Lovelace")).toBe("AL");
  });

  it("takes two letters of a lone word, and a mark for nothing", () => {
    expect(initials("ada")).toBe("AD");
    expect(initials("  ")).toBe("?");
  });

  it("does not split a character outside the BMP", () => {
    expect(initials("😀 smile")).toBe("😀S");
  });
});
