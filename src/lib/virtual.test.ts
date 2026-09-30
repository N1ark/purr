import { describe, expect, it } from "vitest";

import { fixedRange, offsets, rowAt, variableRange } from "./virtual";

describe("fixedRange", () => {
  it("covers the viewport plus overscan, within the list", () => {
    expect(fixedRange(1000, 20, 0, 100)).toEqual([0, 5]);
    expect(fixedRange(1000, 20, 210, 100, 2)).toEqual([8, 18]);
    expect(fixedRange(10, 20, 150, 100, 2)).toEqual([5, 10]);
  });

  it("is empty for an empty list", () => {
    expect(fixedRange(0, 20, 0, 100)).toEqual([0, 0]);
  });

  it("never starts past its end when scrolled beyond the list", () => {
    const [first, end] = fixedRange(10, 20, 5000, 100);
    expect(first).toBeLessThanOrEqual(end);
  });
});

describe("variable heights", () => {
  const heights = [10, 30, 20, 40];
  const tops = offsets(heights.length, (i) => heights[i]);

  it("accumulates offsets, the last being the total", () => {
    expect([...tops]).toEqual([0, 10, 40, 60, 100]);
  });

  it("finds the row under a point", () => {
    expect(rowAt(tops, 0)).toBe(0);
    expect(rowAt(tops, 10)).toBe(1);
    expect(rowAt(tops, 59)).toBe(2);
    expect(rowAt(tops, 1000)).toBe(4);
  });

  it("covers the viewport", () => {
    expect(variableRange(tops, 15, 30)).toEqual([1, 3]);
    expect(variableRange(tops, 15, 30, 100)).toEqual([0, 4]);
    expect(
      variableRange(
        offsets(0, () => 0),
        0,
        100,
      ),
    ).toEqual([0, 0]);
  });
});
