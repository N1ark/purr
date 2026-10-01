import { afterEach, describe, expect, it, vi } from "vitest";

import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";

import { tooltip } from "./tooltip";

function target() {
  const el = document.createElement("button");
  document.body.append(el);
  return el;
}

const bubble = () => document.querySelector<HTMLElement>(".tooltip");

afterEach(() => {
  document.body.innerHTML = "";
  document.body.className = "";
});

describe("tooltip", () => {
  it("shows on hover and hides on leave and press", () => {
    const el = target();
    const action = tooltip(el, "Automatic");
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.textContent).toBe("Automatic");
    expect(bubble()?.classList.contains("show")).toBe(true);
    el.dispatchEvent(new Event("pointerdown"));
    expect(bubble()?.classList.contains("show")).toBe(false);
    action?.destroy?.();
  });

  it("evaluates a function source per hover, and shows nothing for nothing", () => {
    const el = target();
    let text: string | null = null;
    tooltip(el, () => text);
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.classList.contains("show") ?? false).toBe(false);
    text = "Now";
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.textContent).toBe("Now");
  });

  it("puts an icon after the text, and takes it down for the next tooltip", () => {
    const outside = target();
    const plain = target();
    tooltip(outside, { text: "GitHub", icon: ArrowSquareOut });
    tooltip(plain, "Home");
    outside.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.textContent).toBe("GitHub");
    expect(bubble()?.querySelector(".tooltip-icon svg")).not.toBeNull();
    plain.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.querySelector("svg")).toBeNull();
  });

  it("adds a formatted shortcut hint", () => {
    const el = target();
    tooltip(el, { text: "Undo", hint: "⌘Z" });
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.querySelector("kbd")?.textContent).toMatch(/⌘Z|Ctrl\+Z/);
  });

  it("listens on the document, not on each node, and forgets a destroyed one", () => {
    const el = target();
    const spy = vi.spyOn(el, "addEventListener");
    const action = tooltip(el, "Row");
    expect(spy).not.toHaveBeenCalled();
    action?.destroy?.();
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.classList.contains("show") ?? false).toBe(false);
  });

  it("stays out of the way on a phone", () => {
    document.body.classList.add("mobile");
    const el = target();
    tooltip(el, "Hidden");
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.classList.contains("show") ?? false).toBe(false);
  });
});
