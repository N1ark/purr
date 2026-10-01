import { describe, expect, it } from "vitest";

import { clamp, errorMessage, lruCache, moveItem, slugify, topK } from "./util";

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
  const asc = (a: number, b: number) => a - b;

  it("keeps the best few in order", () => {
    expect(topK([5, 1, 4, 2, 3], 3, asc)).toEqual([1, 2, 3]);
    expect(topK([1, 2], 0, asc)).toEqual([]);
    expect(topK([1, 2], -1, asc)).toEqual([]);
  });

  it("returns everything when there are fewer than the limit", () => {
    expect(topK([2, 1], 5, asc)).toEqual([1, 2]);
  });

  it("is stable among equals: the first seen wins the place", () => {
    const items = [
      { k: 1, tag: "first" },
      { k: 1, tag: "second" },
    ];
    expect(topK(items, 1, (a, b) => a.k - b.k)[0].tag).toBe("first");
  });

  it("agrees with a full sort over a long list", () => {
    const items = Array.from({ length: 5000 }, (_, i) => (i * 7919) % 5000);
    expect(topK(items, 8, asc)).toEqual([...items].sort(asc).slice(0, 8));
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

  it("keeps a single entry that is over budget on its own", () => {
    // Dropping it would mean the cache never holds anything at all.
    const cache = lruCache<string, string>(10);
    cache.set("one", "x", 1000);
    expect(cache.get("one")).toBe("x");
  });

  it("replaces a re-set key's weight rather than adding to it", () => {
    const cache = lruCache<string, string>(100);
    cache.set("a", "x", 90);
    cache.set("a", "y", 90);
    cache.set("b", "z", 10);
    expect(cache.get("a")).toBe("y");
    expect(cache.get("b")).toBe("z");
  });

  it("forgets a deleted key, and its weight with it", () => {
    const cache = lruCache<string, string>(100);
    cache.set("a", "x", 100);
    cache.delete("a");
    cache.set("b", "y", 100);
    expect(cache.has("a")).toBe(false);
    expect(cache.has("b")).toBe(true);
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

describe("slugify", () => {
  it("folds accents and joins words with one hyphen", () => {
    expect(slugify("Où est l'été ?")).toBe("ou-est-l-ete");
    expect(slugify("  Meta Garbage Collection: Using OCaml's GC  ")).toBe(
      "meta-garbage-collection-using-ocaml-s-gc",
    );
  });

  it("keeps letters outside Latin", () => {
    expect(slugify("Ἀνθρώπειον 2")).toBe("ανθρωπειον-2");
    expect(slugify("---")).toBe("");
  });
});
