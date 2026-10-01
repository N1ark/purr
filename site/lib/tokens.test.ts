import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { categorise, parseTokens } from "./tokens";

const SMALL = `/* Header, not a token. */
:root {
  --bg: #fff;
  /* The accent. */
  --theme: #8a2aa2;
  --font: "Inter", sans-serif;
}
html.dark {
  --bg: #111;
}
html.density-cozy {
  --font-size: 14px;
}
body.mobile {
  --btn: 44px;
}
.not-a-scope {
  --ignored: 1px;
}`;

describe("parseTokens", () => {
  const tokens = parseTokens(SMALL);
  const byName = new Map(tokens.map((t) => [t.name, t]));

  it("keeps source order and merges scopes", () => {
    expect(tokens.map((t) => t.name)).toEqual([
      "--bg",
      "--theme",
      "--font",
      "--font-size",
      "--btn",
    ]);
    expect(byName.get("--bg")?.values).toEqual({ light: "#fff", dark: "#111" });
    expect(byName.get("--font-size")?.values).toEqual({ cozy: "14px" });
    expect(byName.get("--btn")?.values).toEqual({ mobile: "44px" });
  });

  it("attaches the comment right above a declaration", () => {
    expect(byName.get("--theme")?.note).toBe("The accent.");
    expect(byName.get("--bg")?.note).toBeUndefined();
  });

  it("ignores selectors that are not a scope", () => {
    expect(byName.has("--ignored")).toBe(false);
  });

  it("keeps values with commas and quotes whole", () => {
    expect(byName.get("--font")?.values.light).toBe('"Inter", sans-serif');
  });
});

describe("categorise", () => {
  it("puts unknown names under Other, last", () => {
    const groups = categorise([
      { name: "--bg", values: { light: "#fff" } },
      { name: "--mystery", values: { light: "1" } },
    ]);
    expect(groups.map((g) => g.category.title)).toEqual(["Surfaces and text", "Other"]);
  });
});

describe("the real tokens.css", () => {
  const css = readFileSync(join(process.cwd(), "src/styles/tokens.css"), "utf8");
  const tokens = parseTokens(css);
  const byName = new Map(tokens.map((t) => [t.name, t]));

  it("reads both themes, the densities and touch", () => {
    expect(byName.get("--bg")?.values.light).toBeTruthy();
    expect(byName.get("--bg")?.values.dark).toBeTruthy();
    expect(byName.get("--font-size")?.values.cozy).toBeTruthy();
    expect(byName.get("--font-size")?.values.dense).toBeTruthy();
    expect(byName.get("--btn")?.values.mobile).toBe("44px");
  });

  it("files every token under a named category", () => {
    const other = categorise(tokens).find((g) => g.category.title === "Other");
    expect(other?.tokens.map((t) => t.name) ?? []).toEqual([]);
  });
});
