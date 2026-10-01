import { describe, expect, it } from "vitest";

import { columnCount, packColumns } from "./masonry";

describe("packColumns", () => {
  it("deals each item to the shortest column, leftmost on a tie", () => {
    expect(packColumns([1, 1, 1, 1], 2)).toEqual([
      [0, 2],
      [1, 3],
    ]);
    expect(packColumns([3, 1, 1, 1], 2)).toEqual([[0], [1, 2, 3]]);
  });

  it("always has at least one column", () => {
    expect(packColumns([1, 2], 0)).toEqual([[0, 1]]);
    expect(packColumns([], 3)).toEqual([[], [], []]);
  });
});

describe("columnCount", () => {
  it("fits as many columns as the width allows", () => {
    expect(columnCount(532, 150)).toBe(3);
    expect(columnCount(310, 150, 10)).toBe(2);
    expect(columnCount(0, 150)).toBe(1);
  });
});
