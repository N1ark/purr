import { describe, expect, it } from "vitest";

import { inlineCodeLang } from "./inlineCode";

describe("inlineCodeLang", () => {
  it("splits the language off the end", () => {
    expect(inlineCodeLang("Vec<u8>{:rust}")).toEqual({ code: "Vec<u8>", lang: "rust" });
    expect(inlineCodeLang("std::move(x) {:C++}")).toEqual({ code: "std::move(x)", lang: "c++" });
    expect(inlineCodeLang("[x for x in y]{:python3}")).toEqual({
      code: "[x for x in y]",
      lang: "python3",
    });
  });

  it("keeps braces that belong to the code", () => {
    expect(inlineCodeLang("{ a: 1 }{:ts}")).toEqual({ code: "{ a: 1 }", lang: "ts" });
    expect(inlineCodeLang("{:ts}{:ts}")).toEqual({ code: "{:ts}", lang: "ts" });
  });

  it("is null for a span that names no language", () => {
    expect(inlineCodeLang("plain code")).toBeNull();
    expect(inlineCodeLang("{ a: 1 }")).toBeNull();
    expect(inlineCodeLang("x{:}")).toBeNull();
    expect(inlineCodeLang("x{:two words}")).toBeNull();
    expect(inlineCodeLang("x{:ts} ")).toBeNull();
  });

  it("is null when nothing is left to highlight", () => {
    expect(inlineCodeLang("{:rust}")).toBeNull();
    expect(inlineCodeLang("  {:rust}")).toBeNull();
  });
});
