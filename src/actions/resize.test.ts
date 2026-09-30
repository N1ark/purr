import { describe, expect, it } from "vitest";

import { draggedSize, resizer } from "./resize";

describe("draggedSize", () => {
  it("follows the pointer for a pane on the left or top", () => {
    expect(draggedSize(200, 40, { side: "left" })).toBe(240);
    expect(draggedSize(200, -40, { side: "top", min: 0 })).toBe(160);
  });

  it("grows a pane on the right or bottom as the pointer moves back", () => {
    expect(draggedSize(200, -40, { side: "right" })).toBe(240);
    expect(draggedSize(200, -40, { side: "bottom" })).toBe(240);
  });

  it("clamps to the defaults, or to the bounds given", () => {
    expect(draggedSize(200, -5000, { side: "left" })).toBe(140);
    expect(draggedSize(200, 5000, { side: "left" })).toBe(520);
    expect(draggedSize(200, 5000, { side: "left", max: 300 })).toBe(300);
  });

  it("rounds, so a fractional pointer cannot make a fractional pane", () => {
    expect(draggedSize(200.4, 0.2, { side: "left" })).toBe(201);
  });
});

describe("resizer", () => {
  it("steps with the arrow keys and commits each step", () => {
    const node = document.createElement("div");
    const sizes: number[] = [];
    const committed: number[] = [];
    resizer(node, {
      size: 200,
      side: "right",
      onresize: (s) => sizes.push(s),
      oncommit: (s) => committed.push(s),
    });
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    expect(sizes).toEqual([210, 150, 520]);
    expect(committed).toEqual(sizes);
  });

  it("puts it back to the preset on a double-click", () => {
    const node = document.createElement("div");
    let size = 0;
    resizer(node, { size: 300, side: "left", preset: 216, onresize: (s) => (size = s) });
    node.dispatchEvent(new MouseEvent("dblclick"));
    expect(size).toBe(216);
  });
});
