import { describe, expect, it } from "vitest";

import { entries, isItem, menu, type MenuEntry } from "./menu.svelte";

const item = (label: string): MenuEntry => ({ label });
const heading = (label: string): MenuEntry => ({ kind: "heading", label });

describe("entries", () => {
  it("drops falsy entries", () => {
    expect(entries(item("a"), false, null, undefined, item("b"))).toEqual([item("a"), item("b")]);
  });

  it("drops separators left leading, trailing or doubled", () => {
    expect(
      entries("separator", item("a"), "separator", false, "separator", item("b"), "separator"),
    ).toEqual([item("a"), "separator", item("b")]);
  });

  it("drops a heading whose entries all went", () => {
    expect(entries(heading("Status"), false, heading("Tags"), item("x"), heading("Empty"))).toEqual(
      [heading("Tags"), item("x")],
    );
  });

  it("tells items from the other kinds", () => {
    expect(isItem(item("a"))).toBe(true);
    expect(isItem("separator")).toBe(false);
    expect(isItem(heading("h"))).toBe(false);
  });
});

describe("the menu singleton", () => {
  it("opens at the event and suppresses the browser's menu", () => {
    const e = new MouseEvent("contextmenu", { clientX: 10, clientY: 20, cancelable: true });
    menu.show(e, [item("Copy")], "Title");
    expect(menu.open).toBe(true);
    expect(menu.anchor).toEqual({ x: 10, y: 20 });
    expect(e.defaultPrevented).toBe(true);
  });

  it("does not open, or suppress anything, with nothing to show", () => {
    menu.close();
    const e = new MouseEvent("contextmenu", { cancelable: true });
    menu.show(e, [false, "separator"]);
    expect(menu.open).toBe(false);
    expect(e.defaultPrevented).toBe(false);
  });

  it("ignores a close meant for the menu it replaced", () => {
    menu.showAt(0, 0, [item("a")]);
    const old = menu.version;
    menu.showAt(5, 5, [item("b")]);
    menu.close(old);
    expect(menu.open).toBe(true);
    menu.close(menu.version);
    expect(menu.open).toBe(false);
  });
});
