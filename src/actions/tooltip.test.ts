import { afterEach, describe, expect, it } from "vitest";

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

  it("adds a formatted shortcut hint", () => {
    const el = target();
    tooltip(el, { text: "Undo", hint: "⌘Z" });
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.querySelector("kbd")?.textContent).toMatch(/⌘Z|Ctrl\+Z/);
  });

  it("stays out of the way on a phone", () => {
    document.body.classList.add("mobile");
    const el = target();
    tooltip(el, "Hidden");
    el.dispatchEvent(new Event("pointerenter"));
    expect(bubble()?.classList.contains("show") ?? false).toBe(false);
  });
});
