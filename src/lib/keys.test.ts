import { describe, expect, it } from "vitest";

import {
  accelerator,
  createKeymap,
  formatShortcut,
  helpGroups,
  isTyping,
  matches,
  parseShortcut,
  resolveKey,
  type Binding,
  type KeyContext,
  type KeyLike,
} from "./keys";
import { registerOverlay } from "./overlays.svelte";

const key = (k: string, mods: Partial<KeyLike> = {}): KeyLike => ({
  key: k,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...mods,
});

describe("parseShortcut", () => {
  it("reads the modifiers in any order and names the key", () => {
    expect(parseShortcut("⇧⌘K")).toEqual({
      key: "k",
      mod: true,
      ctrl: false,
      shift: true,
      alt: false,
    });
    expect(parseShortcut("⌥↓").key).toBe("arrowdown");
    expect(parseShortcut("↩").key).toBe("enter");
    expect(parseShortcut("Esc").key).toBe("escape");
    expect(parseShortcut("Space").key).toBe(" ");
  });

  it("refuses a modifier with no key", () => {
    expect(() => parseShortcut("⌘")).toThrow();
  });
});

describe("matches", () => {
  it("takes ⌘ from Meta or Ctrl", () => {
    expect(matches("⌘K", key("k", { metaKey: true }))).toBe(true);
    expect(matches("⌘K", key("k", { ctrlKey: true }))).toBe(true);
    expect(matches("⌘K", key("k"))).toBe(false);
  });

  it("holds Shift and Alt to what the hint says", () => {
    expect(matches("⇧⌘Z", key("Z", { metaKey: true, shiftKey: true }))).toBe(true);
    expect(matches("⌘Z", key("Z", { metaKey: true, shiftKey: true }))).toBe(false);
    expect(matches("j", key("J", { shiftKey: true }))).toBe(false);
    expect(matches("⇧J", key("J", { shiftKey: true }))).toBe(true);
    expect(matches("j", key("j", { altKey: true }))).toBe(false);
  });

  it("does not ask for Shift on a symbol that already needs it", () => {
    expect(matches("?", key("?", { shiftKey: true }))).toBe(true);
    expect(matches("*", key("*", { shiftKey: true }))).toBe(true);
  });

  it("finds the letter under ⌥, which a Mac turns into a symbol", () => {
    expect(matches("⌥J", key("∆", { altKey: true, code: "KeyJ" }))).toBe(true);
    // Without ⌥ the layout's own letter is the truth: AZERTY's A sits on KeyQ.
    expect(matches("⌘Q", key("a", { metaKey: true, code: "KeyQ" }))).toBe(false);
  });

  it("keeps ⌃ apart from ⌘", () => {
    expect(matches("⌃N", key("n", { ctrlKey: true }))).toBe(true);
    expect(matches("⌃N", key("n", { metaKey: true }))).toBe(false);
  });

  it("names the special keys", () => {
    expect(matches("↩", key("Enter"))).toBe(true);
    expect(matches("⌘↩", key("Enter", { metaKey: true }))).toBe(true);
    expect(matches("Esc", key("Escape"))).toBe(true);
    expect(matches("⇧⇥", key("Tab", { shiftKey: true }))).toBe(true);
  });

  it("never matches a chord in one keypress", () => {
    expect(matches("g i", key("g"))).toBe(false);
  });
});

describe("formatShortcut", () => {
  it("writes glyphs on a Mac", () => {
    expect(formatShortcut("⇧⌘K", { mac: true })).toBe("⇧⌘K");
    expect(formatShortcut("⌘⇧K", { mac: true })).toBe("⇧⌘K");
    expect(formatShortcut("⌘↩", { mac: true })).toBe("⌘↩");
  });

  it("writes words joined by + everywhere else", () => {
    expect(formatShortcut("⇧⌘K", { mac: false })).toBe("Ctrl+Shift+K");
    expect(formatShortcut("⌥↓", { mac: false })).toBe("Alt+↓");
    expect(formatShortcut("⌘↩", { mac: false })).toBe("Ctrl+Enter");
    expect(formatShortcut("⌘,", { mac: false })).toBe("Ctrl+,");
  });

  it("keeps a bare key as written, and a chord's steps in order", () => {
    expect(formatShortcut("j", { mac: false })).toBe("j");
    expect(formatShortcut("g i", { mac: true })).toBe("g i");
    expect(formatShortcut("Esc", { mac: false })).toBe("Esc");
  });
});

describe("accelerator", () => {
  it("turns a hint into Tauri's syntax", () => {
    expect(accelerator("⇧⌘Z")).toBe("CmdOrCtrl+Shift+Z");
    expect(accelerator("⌘↩")).toBe("CmdOrCtrl+Enter");
    expect(accelerator("⌘,")).toBe("CmdOrCtrl+,");
    expect(accelerator(undefined)).toBeUndefined();
    expect(accelerator("g i")).toBeUndefined();
  });
});

describe("isTyping", () => {
  it("counts text fields and not checkboxes", () => {
    const text = document.createElement("input");
    const box = Object.assign(document.createElement("input"), { type: "checkbox" });
    expect(isTyping(text)).toBe(true);
    expect(isTyping(box)).toBe(false);
    expect(isTyping(document.createElement("textarea"))).toBe(true);
    expect(isTyping(document.createElement("div"))).toBe(false);
    expect(isTyping(null)).toBe(false);
  });
});

type Action =
  "switcher" | "next" | "prev" | "narrow" | "narrow-channel" | "inbox" | "menu" | "help";

const BINDINGS: Binding<Action>[] = [
  { keys: "⌘K", action: "switcher", label: "Jump to", group: "General" },
  { keys: "?", action: "help", label: "Show this list", group: "General" },
  { keys: "j", action: "next", label: "Next", group: "Navigation" },
  { keys: "↓", action: "next", label: "Next", group: "Navigation" },
  { keys: "k", action: "prev", label: "Previous", group: "Navigation" },
  { keys: "s", action: "narrow", label: "Narrow", group: "Navigation" },
  { keys: "⇧S", action: "narrow-channel", label: "Narrow to channel", group: "Navigation" },
  { keys: "g i", action: "inbox", label: "Inbox", group: "Navigation" },
  { keys: "i", action: "menu", label: "Actions", group: "Selected" },
];

const ctx = (over: Partial<KeyContext> = {}): KeyContext => ({
  chord: null,
  typing: false,
  overlay: false,
  ...over,
});

describe("resolveKey", () => {
  it("resolves a plain key, telling Shift apart", () => {
    expect(resolveKey(BINDINGS, key("s"), ctx())).toMatchObject({ action: "narrow" });
    expect(resolveKey(BINDINGS, key("S", { shiftKey: true }), ctx())).toMatchObject({
      action: "narrow-channel",
    });
  });

  it("holds a chord prefix, then resolves against it", () => {
    expect(resolveKey(BINDINGS, key("g"), ctx())).toEqual({ kind: "chord", prefix: "g" });
    expect(resolveKey(BINDINGS, key("i"), ctx({ chord: "g" }))).toMatchObject({ action: "inbox" });
  });

  it("drops a chord nobody bound, rather than falling back to the plain key", () => {
    expect(resolveKey(BINDINGS, key("z"), ctx({ chord: "g" }))).toEqual({ kind: "none" });
    expect(resolveKey(BINDINGS, key("i"), ctx())).toMatchObject({ action: "menu" });
  });

  it("leaves plain keys alone while typing or under an overlay", () => {
    expect(resolveKey(BINDINGS, key("j"), ctx({ typing: true }))).toEqual({ kind: "none" });
    expect(resolveKey(BINDINGS, key("j"), ctx({ overlay: true }))).toEqual({ kind: "none" });
    expect(resolveKey(BINDINGS, key("g"), ctx({ typing: true }))).toEqual({ kind: "none" });
  });

  it("still fires the modifier ones, which is what they are for", () => {
    const hit = resolveKey(
      BINDINGS,
      key("k", { metaKey: true }),
      ctx({ typing: true, overlay: true }),
    );
    expect(hit).toMatchObject({ action: "switcher" });
  });

  it("lets a binding opt out of typing, leaving ⌘Z to a field's own undo", () => {
    const undo: Binding[] = [{ keys: "⌘Z", action: "undo", label: "Undo", typing: false }];
    expect(resolveKey(undo, key("z", { metaKey: true }), ctx({ typing: true }))).toEqual({
      kind: "none",
    });
  });

  it("ignores a bare modifier press", () => {
    expect(resolveKey(BINDINGS, key("Shift", { shiftKey: true }), ctx())).toEqual({ kind: "none" });
  });
});

describe("helpGroups", () => {
  it("folds aliases into one row and keeps the group order", () => {
    const groups = helpGroups(BINDINGS, { groups: ["Navigation", "General"] });
    expect(groups.map((g) => g.title)).toEqual(["Navigation", "General", "Selected"]);
    const next = groups[0].entries.find((e) => e.label === "Next");
    expect(next?.hints).toEqual(["j", "↓"]);
  });

  it("lists extra rows and leaves hidden bindings out", () => {
    const groups = helpGroups(
      [...BINDINGS, { keys: "⇧J", action: "next", label: "Secret", hidden: true }],
      { extra: [{ label: "Bold", hints: ["⌘B"], group: "Composing" }] },
    );
    const all = groups.flatMap((g) => g.entries);
    expect(all.some((e) => e.label === "Secret")).toBe(false);
    expect(groups.at(-1)).toEqual({
      title: "Composing",
      entries: [{ label: "Bold", hints: ["⌘B"] }],
    });
  });
});

describe("createKeymap", () => {
  const event = (k: string, mods: KeyboardEventInit = {}, target: EventTarget = document.body) => {
    const e = new KeyboardEvent("keydown", { key: k, cancelable: true, ...mods });
    Object.defineProperty(e, "target", { value: target });
    return e;
  };

  it("runs the action and prevents the default", () => {
    const map = createKeymap(BINDINGS);
    const ran: string[] = [];
    const e = event("j");
    expect(map.handle(e, (a) => void ran.push(a))).toBe(true);
    expect(ran).toEqual(["next"]);
    expect(e.defaultPrevented).toBe(true);
  });

  it("lets the key through when the action had nothing to act on", () => {
    const map = createKeymap(BINDINGS);
    const e = event("j");
    expect(map.handle(e, () => false)).toBe(false);
    expect(e.defaultPrevented).toBe(false);
  });

  it("carries a chord across a Shift press", () => {
    const map = createKeymap(BINDINGS);
    const ran: string[] = [];
    map.handle(event("g"), (a) => void ran.push(a));
    map.handle(event("Shift", { shiftKey: true }), (a) => void ran.push(a));
    map.handle(event("i"), (a) => void ran.push(a));
    expect(ran).toEqual(["inbox"]);
  });

  it("reads the overlay stack and the focused field itself", () => {
    const map = createKeymap(BINDINGS);
    const ran: string[] = [];
    map.handle(event("j", {}, document.createElement("input")), (a) => void ran.push(a));
    const stop = registerOverlay(() => {});
    map.handle(event("j"), (a) => void ran.push(a));
    stop();
    expect(ran).toEqual([]);
  });
});
