import { describe, expect, it } from "vitest";
import { firstWeekday, monthGrid } from "./calendar";

describe("monthGrid", () => {
  it("lays a month out in six weeks from the week start", () => {
    // October 2026 starts on a Thursday.
    const days = monthGrid(2026, 9, 1);
    expect(days).toHaveLength(42);
    expect(days[0]).toEqual({ key: "2026-09-28", date: 28, inMonth: false });
    expect(days[3]).toEqual({ key: "2026-10-01", date: 1, inMonth: true });
    expect(days.filter((d) => d.inMonth)).toHaveLength(31);
    expect(days[41].key).toBe("2026-11-08");
  });

  it("starts on Sunday when asked, without a lead when the month does", () => {
    expect(monthGrid(2026, 9, 0)[0].key).toBe("2026-09-27");
    expect(monthGrid(2026, 1, 0)[0].key).toBe("2026-02-01");
  });

  it("crosses a year", () => {
    expect(monthGrid(2026, 11, 1).at(-1)!.key).toBe("2027-01-10");
  });
});

describe("firstWeekday", () => {
  it("reads the locale, Monday when it can't", () => {
    expect(firstWeekday("en-GB")).toBe(1);
    expect([0, 1]).toContain(firstWeekday("en-US"));
    expect(firstWeekday("not a locale!")).toBe(1);
  });
});
