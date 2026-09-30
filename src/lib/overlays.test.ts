import { afterEach, describe, expect, it } from "vitest";

import { closeAllOverlays, closeTopOverlay, hasOverlay, registerOverlay } from "./overlays.svelte";

const cleanups: (() => void)[] = [];
function open(options: Parameters<typeof registerOverlay>[1] = {}) {
  const state = { closed: false };
  const unregister = registerOverlay(() => {
    state.closed = true;
    unregister();
  }, options);
  cleanups.push(unregister);
  return state;
}

function press(key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  document.body.dispatchEvent(e);
  return e;
}

function pointerDown(target: Element) {
  target.dispatchEvent(new Event("pointerdown", { bubbles: true }));
}

afterEach(() => {
  cleanups.splice(0).forEach((fn) => fn());
  document.body.innerHTML = "";
});

describe("the overlay stack", () => {
  it("closes only the topmost on Escape", () => {
    const below = open();
    const above = open();
    const e = press("Escape");
    expect(above.closed).toBe(true);
    expect(below.closed).toBe(false);
    expect(e.defaultPrevented).toBe(true);
    press("Escape");
    expect(below.closed).toBe(true);
    expect(hasOverlay()).toBe(false);
  });

  it("leaves an Escape a field already handled, or one with a modifier", () => {
    const layer = open();
    const input = document.createElement("input");
    document.body.append(input);
    input.addEventListener("keydown", (e) => e.preventDefault());
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    press("Escape", { shiftKey: true });
    expect(layer.closed).toBe(false);
  });

  it("skips a layer that opts out of Escape", () => {
    const below = open();
    const sticky = open({ escape: false });
    press("Escape");
    expect(sticky.closed).toBe(false);
    expect(below.closed).toBe(true);
  });

  it("closes each layer a press lands outside of, down to one that contains it", () => {
    document.body.innerHTML = `<div id="modal"><div id="card"></div></div><div id="menu"></div><div id="out"></div>`;
    const byId = (id: string) => document.getElementById(id)!;
    const modal = open();
    const card = open({ element: () => byId("card") });
    const menu = open({ element: () => byId("menu") });

    pointerDown(byId("card"));
    expect(menu.closed).toBe(true);
    expect(card.closed).toBe(false);

    pointerDown(byId("out"));
    expect(card.closed).toBe(true);
    // No element: the modal's scrim is its own affair.
    expect(modal.closed).toBe(false);
  });

  it("treats the ignored elements as inside", () => {
    document.body.innerHTML = `<button id="trigger"></button><div id="pop"></div>`;
    const pop = open({
      element: () => document.getElementById("pop"),
      ignore: () => document.getElementById("trigger"),
    });
    pointerDown(document.getElementById("trigger")!);
    expect(pop.closed).toBe(false);
  });

  it("closes volatile layers on resize and leaves the rest", () => {
    const steady = open();
    const menu = open({ volatile: true });
    window.dispatchEvent(new Event("resize"));
    expect(menu.closed).toBe(true);
    expect(steady.closed).toBe(false);
  });

  it("closes the top one, or all of them, on request", () => {
    const a = open();
    const b = open();
    expect(closeTopOverlay()).toBe(true);
    expect(b.closed).toBe(true);
    open();
    closeAllOverlays();
    expect(a.closed).toBe(true);
    expect(closeTopOverlay()).toBe(false);
  });
});
