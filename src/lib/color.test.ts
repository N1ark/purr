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
  toOklch,
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

  it("reads oklch(), in either lightness unit and with or without alpha", () => {
    expect(toHex(parseColor("oklch(0.484 0.193 318.7)"))).toBe("#8a2aa2");
    expect(toHex(parseColor("oklch(48.4% 0.193 318.7deg / 0.5)"))).toBe("#8a2aa2");
    expect(parseColor("oklch(1 0 0)")).toEqual([255, 255, 255]);
  });

  it("clips a colour outside sRGB rather than wrapping it", () => {
    expect(parseColor("oklch(0.9 0.4 140)").every((c) => c >= 0 && c <= 255)).toBe(true);
  });

  it("refuses a colour it cannot read rather than scoring it", () => {
    expect(() => parseColor("rebeccapurple")).toThrow();
  });
});

describe("toOklch", () => {
  it("round-trips through oklch()", () => {
    for (const hex of ["#8a2aa2", "#c0392b", "#61afef", "#0b0b0c"]) {
      const [l, c, h] = toOklch(parseColor(hex));
      expect(toHex(parseColor(`oklch(${l} ${c} ${h})`))).toBe(hex);
    }
  });

  it("gives a grey no hue", () => {
    const [l, c, h] = toOklch([255, 255, 255]);
    expect(l).toBeCloseTo(1, 4);
    expect(c).toBeLessThan(1e-4);
    expect(h).toBe(0);
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

  it("holds one lightness and stays inside sRGB on every hue", () => {
    for (let seed = 0; seed < 360; seed++) {
      const [l, c] = toOklch(parseColor(colorFromSeed(seed)));
      expect(l).toBeCloseTo(0.5, 2);
      expect(c).toBeCloseTo(0.08, 2);
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
