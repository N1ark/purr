import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { persisted } from "./persisted.svelte";
import {
  memoryStorage,
  readFlag,
  readJson,
  readString,
  writeFlag,
  writeJson,
  writeString,
} from "./storage";

describe("storage", () => {
  beforeEach(() => vi.stubGlobal("localStorage", memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it("round-trips strings, JSON and flags", () => {
    writeString("s", "x");
    expect(readString("s")).toBe("x");
    writeJson("j", { a: 1 });
    expect(readJson("j", null)).toEqual({ a: 1 });
    writeFlag("f", true);
    expect(readFlag("f", false)).toBe(true);
    writeString("s", null);
    expect(readString("s")).toBeNull();
  });

  it("falls back on a missing, corrupt or stale value", () => {
    expect(readJson("missing", 3)).toBe(3);
    writeString("j", "{nope");
    expect(readJson("j", 3)).toBe(3);
    writeJson("j", "text");
    const isNumber = (v: unknown): v is number => typeof v === "number";
    expect(readJson("j", 3, isNumber)).toBe(3);
  });

  it("survives a storage that throws", () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("quota");
      },
    });
    expect(readString("x")).toBeNull();
    expect(() => writeString("x", "y")).not.toThrow();
  });

  it("persists a rune on assignment", () => {
    const open = persisted("open", false);
    expect(open.value).toBe(false);
    open.value = true;
    expect(readJson("open", false)).toBe(true);
    expect(persisted("open", false).value).toBe(true);
  });
});
