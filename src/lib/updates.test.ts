import { describe, expect, it, vi } from "vitest";

import { createUpdater } from "./updater.svelte";
import { dueForCheck, noteLines, noteSummary } from "./updates";

describe("dueForCheck", () => {
  it("checks at first, then after the interval", () => {
    expect(dueForCheck(0, 1000)).toBe(true);
    expect(dueForCheck(1000, 2000, 5000)).toBe(false);
    expect(dueForCheck(1000, 7000, 5000)).toBe(true);
  });

  it("checks when the clock went backwards", () => {
    expect(dueForCheck(5000, 1000)).toBe(true);
  });
});

describe("noteLines", () => {
  const notes =
    "## Added\n\n- A thing\n  that wraps\n- Another\n\nSome prose\ncontinued.\n### Fixed\n* Bug";

  it("flattens bullets, headings and wrapped prose", () => {
    expect(noteLines(notes)).toEqual([
      { text: "Added", heading: true },
      { text: "A thing that wraps", heading: false },
      { text: "Another", heading: false },
      { text: "Some prose continued.", heading: false },
      { text: "Fixed", heading: true },
      { text: "Bug", heading: false },
    ]);
  });

  it("summarises without the headings", () => {
    expect(noteSummary(notes, 2)).toEqual(["A thing that wraps", "Another"]);
  });
});

describe("Updater", () => {
  it("checks, downloads and stages; restarting runs the hook first", async () => {
    const order: string[] = [];
    const updater = createUpdater({
      check: async () => ({ version: "2.0.0" }),
      download: async () => void order.push("download"),
      beforeRestart: async () => void order.push("flush"),
      restart: async (info) => void order.push(`restart ${info.version}`),
    });
    expect(await updater.check()).toEqual({ version: "2.0.0" });
    expect(updater.stage).toBe("ready");
    await updater.restart();
    expect(order).toEqual(["download", "flush", "restart 2.0.0"]);
  });

  it("is ready at once where the check downloads too", async () => {
    const updater = createUpdater({
      check: async () => ({ version: "1.1" }),
      restart: async () => {},
    });
    await updater.check();
    expect(updater.ready).toBe(true);
  });

  it("keeps an automatic failure quiet and reports an asked-for one", async () => {
    const updater = createUpdater({
      check: async () => Promise.reject(new Error("offline")),
      restart: async () => {},
    });
    await updater.check();
    expect(updater.error).toBeNull();
    await updater.check(true);
    expect(updater.error).toBe("offline");
    expect(updater.stage).toBe("idle");
  });

  it("skips automatic checks when turned off or not yet due", async () => {
    const check = vi.fn(async () => null);
    const off = createUpdater({ check, restart: async () => {}, enabled: () => false });
    await off.check();
    expect(check).not.toHaveBeenCalled();
    await off.check(true);
    expect(check).toHaveBeenCalledTimes(1);
    const recent = createUpdater({ check, restart: async () => {}, checkedAt: Date.now() });
    await recent.check();
    expect(check).toHaveBeenCalledTimes(1);
  });
});
