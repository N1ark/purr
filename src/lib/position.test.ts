import { describe, expect, it } from "vitest";

import { place, toRect } from "./position";

const viewport = { width: 800, height: 600 };
const box = { width: 200, height: 100 };

describe("place at a point", () => {
  it("opens down and right of the point when there is room", () => {
    expect(
      place({ x: 100, y: 100, width: 0, height: 0 }, box, viewport, { placement: "point" }),
    ).toMatchObject({
      x: 100,
      y: 100,
    });
  });

  it("flips away from the edges it would cross", () => {
    const at = place({ x: 750, y: 580, width: 0, height: 0 }, box, viewport, {
      placement: "point",
    });
    expect(at).toMatchObject({ x: 550, y: 480 });
  });

  it("clamps rather than leaving the screen when neither side fits", () => {
    const at = place({ x: 50, y: 50, width: 0, height: 0 }, { width: 900, height: 50 }, viewport, {
      placement: "point",
    });
    expect(at.x).toBe(8);
  });
});

describe("place beside an anchor", () => {
  const button = { x: 300, y: 50, width: 40, height: 20 };

  it("hangs below, aligned to the start", () => {
    expect(place(button, box, viewport)).toEqual({ x: 300, y: 74, placement: "bottom-start" });
  });

  it("aligns to the end", () => {
    expect(place(button, box, viewport, { placement: "bottom-end" }).x).toBe(140);
  });

  it("flips to the side with more room, and reports it", () => {
    const low = { ...button, y: 560 };
    expect(place(low, box, viewport)).toEqual({ x: 300, y: 456, placement: "top-start" });
  });

  it("holds its side when asked not to flip, sliding to stay on screen", () => {
    const low = { ...button, y: 560 };
    expect(place(low, box, viewport, { flip: false })).toMatchObject({
      y: 492,
      placement: "bottom-start",
    });
  });

  it("slides along the edge instead of running off it", () => {
    const right = { ...button, x: 760 };
    expect(place(right, box, viewport).x).toBe(592);
  });

  it("opens a submenu to the side, flipping left at the right edge", () => {
    const row = { x: 650, y: 100, width: 140, height: 24 };
    expect(place(row, box, viewport, { placement: "right-start", offset: 0 })).toMatchObject({
      x: 450,
      placement: "left-start",
    });
  });
});

describe("toRect", () => {
  it("reads a point as an empty rect", () => {
    expect(toRect({ x: 3, y: 4 })).toEqual({ x: 3, y: 4, width: 0, height: 0 });
  });
});
