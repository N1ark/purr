import { afterEach, describe, expect, it, vi } from "vitest";

import { toast, toasts } from "./toast.svelte";

describe("toasts", () => {
  afterEach(() => {
    toasts.clear();
    vi.useRealTimers();
  });

  it("shows and times out, errors lasting longer", () => {
    vi.useFakeTimers();
    toast("Copied");
    vi.spyOn(console, "error").mockImplementation(() => {});
    toast.error(new Error("Push failed"));
    expect(toasts.list.map((t) => [t.text, t.kind])).toEqual([
      ["Copied", "info"],
      ["Push failed", "error"],
    ]);
    vi.advanceTimersByTime(3500);
    expect(toasts.list.map((t) => t.text)).toEqual(["Push failed"]);
    vi.advanceTimersByTime(5000);
    expect(toasts.list).toEqual([]);
  });

  it("replaces an identical notice instead of stacking it", () => {
    toast("Saved");
    toast("Saved");
    expect(toasts.list).toHaveLength(1);
  });

  it("keeps a sticky toast until dismissed, and caps the stack", () => {
    const id = toast("Sticky", { timeout: 0 });
    for (let i = 0; i < 6; i++) toast(`n${i}`);
    expect(toasts.list).toHaveLength(4);
    toasts.dismiss(id);
    expect(toasts.list.some((t) => t.id === id)).toBe(false);
  });
});
