import { describe, expect, it } from "vitest";

import { clamp, errorMessage, lruCache, moveItem, topK } from "./util";

describe("clamp", () => {
  it("bounds a value", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
});

describe("moveItem", () => {
  it("moves without mutating", () => {
    const list = ["a", "b", "c", "d"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(list, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(list).toEqual(["a", "b", "c", "d"]);
  });

  it("ignores a source out of range", () => {
    expect(moveItem(["a"], 4, 0)).toEqual(["a"]);
  });
});

describe("topK", () => {
  it("keeps the best few in order", () => {
    expect(topK([5, 1, 4, 2, 3], 3, (a, b) => a - b)).toEqual([1, 2, 3]);
    expect(topK([1, 2], 0, (a, b) => a - b)).toEqual([]);
  });
});

describe("lruCache", () => {
  it("evicts the least recently used past the budget", () => {
    const cache = lruCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a");
    cache.set("c", 3);
    expect(cache.has("b")).toBe(false);
    expect(cache.get("a")).toBe(1);
  });

  it("counts weight against the budget", () => {
    const cache = lruCache<string, string>(10);
    cache.set("big", "x", 8);
    cache.set("bigger", "y", 8);
    expect(cache.has("big")).toBe(false);
    expect(cache.has("bigger")).toBe(true);
  });
});

describe("errorMessage", () => {
  it("reads strings, errors and error-shaped objects", () => {
    expect(errorMessage("nope")).toBe("nope");
    expect(errorMessage(new Error("boom"))).toBe("boom");
    expect(errorMessage({ message: "shaped" })).toBe("shaped");
    expect(errorMessage(42)).toBe("42");
  });
});
