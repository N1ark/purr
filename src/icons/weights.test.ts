import { describe, expect, it } from "vitest";
import { STROKE, circle } from "./weights";

describe("icon weights", () => {
  it("matches Phosphor's regular line at 16 and grows with weight", () => {
    expect(STROKE.regular).toBe(16);
    expect(STROKE.thin < STROKE.light && STROKE.light < STROKE.regular).toBe(true);
    expect(STROKE.bold).toBeGreaterThan(STROKE.regular);
  });

  it("draws a closed circle from two arcs", () => {
    expect(circle(128, 128, 28)).toBe("M100,128a28,28 0 1,0 56,0a28,28 0 1,0 -56,0Z");
  });
});
