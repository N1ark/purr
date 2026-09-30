import { describe, expect, it } from "vitest";

import {
  EXACT,
  PREFIX,
  SUBSEQUENCE,
  SUBSTRING,
  WORD_START,
  byName,
  fuzzyMatch,
  highlightRuns,
  matchScore,
  matchesAny,
  rank,
} from "./fuzzy";

const tier = (q: string, t: string) => fuzzyMatch(q, t)?.tier;

describe("fuzzyMatch", () => {
  it("ranks the tiers", () => {
    expect(tier("design", "Design")).toBe(EXACT);
    expect(tier("des", "Design the schema")).toBe(PREFIX);
    expect(tier("sch", "Design the Schema")).toBe(WORD_START);
    expect(tier("sig", "Design")).toBe(SUBSTRING);
    expect(tier("srst", "soteria-rust")).toBe(SUBSEQUENCE);
    expect(fuzzyMatch("zz", "soteria")).toBeNull();
  });

  it("counts a camel hump as a word start", () => {
    expect(tier("sw", "QuickSwitcher")).toBe(WORD_START);
    expect(fuzzyMatch("qs", "QuickSwitcher")?.indices).toEqual([0, 5]);
  });

  it("returns the indices to highlight", () => {
    expect(fuzzyMatch("sch", "Design the Schema")?.indices).toEqual([11, 12, 13]);
    expect(fuzzyMatch("srst", "soteria-rust")?.indices).toEqual([0, 8, 10, 11]);
  });

  it("prefers word starts inside a subsequence", () => {
    expect(fuzzyMatch("gd", "git dialog")?.indices).toEqual([0, 4]);
  });

  it("orders within a tier: shorter first, earlier first", () => {
    expect(matchScore("ta", "tada")!).toBeGreaterThan(matchScore("ta", "tabulate")!);
    expect(matchScore("rust", "a rust")!).toBeGreaterThan(matchScore("rust", "a big rust")!);
  });

  it("never lets an in-tier bonus cross a tier", () => {
    const longPrefix = matchScore("a", "a" + "x".repeat(900))!;
    const shortWord = matchScore("a", "b a")!;
    expect(longPrefix).toBeGreaterThan(shortWord);
  });

  it("matches everything for an empty query", () => {
    expect(fuzzyMatch("  ", "anything")?.tier).toBe(EXACT);
    expect(matchScore("", "x")).not.toBeNull();
  });

  it("is case-blind", () => {
    expect(tier("SCHEMA", "schema")).toBe(EXACT);
  });
});

describe("rank", () => {
  const people = [
    { name: "Tabitha", email: "t@x.org" },
    { name: "Tad", email: "tad@x.org" },
    { name: "Olga", email: "tadpole@x.org" },
    { name: "Nobody", email: "n@x.org" },
  ];
  const keys = [(p: (typeof people)[number]) => p.name, (p: (typeof people)[number]) => p.email];

  it("orders by score and demotes a match on a secondary field by a tier", () => {
    const hits = rank(people, "tad", { keys });
    expect(hits.map((h) => h.item.name)).toEqual(["Tad", "Olga"]);
    expect(hits[1].field).toBe(1);
    expect(hits[0].indices).toEqual([0, 1, 2]);
  });

  it("keeps the best `limit` without sorting everything", () => {
    const hits = rank(people, "t", { keys, limit: 2 });
    expect(hits.map((h) => h.item.name)).toEqual(["Tad", "Tabitha"]);
  });

  it("keeps the input order for an empty query", () => {
    expect(rank(people, "", { keys, limit: 3 }).map((h) => h.item.name)).toEqual([
      "Tabitha",
      "Tad",
      "Olga",
    ]);
  });

  it("breaks ties with the caller's order", () => {
    const items = ["b-x", "a-x"];
    const hits = rank(items, "x", { keys: [(s) => s], tieBreak: (a, b) => byName(a, b) });
    expect(hits.map((h) => h.item)).toEqual(["a-x", "b-x"]);
  });
});

describe("highlightRuns", () => {
  it("splits into plain and matched runs", () => {
    expect(highlightRuns("Schema", [0, 1, 3])).toEqual([
      { text: "Sc", hit: true },
      { text: "h", hit: false },
      { text: "e", hit: true },
      { text: "ma", hit: false },
    ]);
    expect(highlightRuns("abc", [])).toEqual([{ text: "abc", hit: false }]);
  });
});

describe("matchesAny", () => {
  it("narrows by substring on any field", () => {
    expect(matchesAny("ar", "Mars", null)).toBe(true);
    expect(matchesAny("zz", "Mars", "Venus")).toBe(false);
    expect(matchesAny(" ", "anything")).toBe(true);
  });
});
