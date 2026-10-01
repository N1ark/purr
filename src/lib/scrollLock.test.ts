import { describe, expect, it } from "vitest";

import { lockScroll } from "./scrollLock";

describe("lockScroll", () => {
  it("holds the page until the last lock is released, then restores it", () => {
    const root = document.documentElement;
    root.style.overflow = "auto";
    const first = lockScroll();
    const second = lockScroll();
    expect(root.style.overflow).toBe("hidden");
    first();
    first();
    expect(root.style.overflow).toBe("hidden");
    second();
    expect(root.style.overflow).toBe("auto");
  });
});
