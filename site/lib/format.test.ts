import { describe, expect, it } from "vitest";
import { describe as show, describeCall, inlineCode } from "./format";

describe("describe", () => {
  it("names events and elements rather than dumping them", () => {
    expect(show(new MouseEvent("click"))).toBe("MouseEvent");
    expect(show(new KeyboardEvent("keydown", { key: "Enter" }))).toBe("KeyboardEvent Enter");
    expect(show(document.createElement("button"))).toBe("<button>");
  });

  it("writes values briefly", () => {
    expect(show("hi")).toBe('"hi"');
    expect(show(3)).toBe("3");
    expect(show(null)).toBe("null");
    expect(show(() => 1)).toBe("ƒ");
    expect(show([1, "a"])).toBe('[1, "a"]');
    expect(show({ a: 1, run: () => 1 })).toBe("{ a: 1 }");
    expect(show({ a: { b: { c: 1 } } })).toBe("{ a: { b: {…} } }");
    expect(show("x".repeat(100)).length).toBe(60);
  });

  it("joins a call's arguments", () => {
    expect(describeCall([1, true])).toBe("1, true");
  });
});

describe("inlineCode", () => {
  it("escapes and turns backticks into code", () => {
    expect(inlineCode("Use `<Button>` & co")).toBe("Use <code>&lt;Button&gt;</code> &amp; co");
  });
});
