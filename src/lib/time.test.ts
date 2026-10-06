import { describe, expect, it } from "vitest";

import {
  parseTime,
  formatAbsolute,
  formatClock,
  addDays,
  dayKey,
  daysBetween,
  formatDay,
  formatDate,
  formatMonth,
  formatWeekday,
  formatRelative,
  isSameDay,
  isoDate,
  setTwentyFourHourClock,
  startOfDay,
} from "./time";

const NOW = new Date(2025, 8, 12, 15, 0).getTime();

describe("formatRelative", () => {
  it("says just now under a minute", () => {
    expect(formatRelative(NOW - 20_000, { now: NOW })).toBe("just now");
    expect(formatRelative(NOW - 20_000, { now: NOW, justNow: "now" })).toBe("now");
  });

  it("picks the largest whole unit", () => {
    expect(formatRelative(NOW - 5 * 60_000, { now: NOW, style: "long" })).toBe("5 minutes ago");
    expect(formatRelative(NOW - 3 * 3600_000, { now: NOW, style: "long" })).toBe("3 hours ago");
    expect(formatRelative(NOW + 2 * 86400_000, { now: NOW, style: "long" })).toBe("in 2 days");
  });

  it("reads ISO strings and marks an unreadable date", () => {
    expect(
      formatRelative(new Date(NOW - 7200_000).toISOString(), { now: NOW, style: "long" }),
    ).toBe("2 hours ago");
    expect(formatRelative("not a date", { now: NOW })).toBe("—");
  });
});

describe("days", () => {
  it("compares local days, not 24-hour spans", () => {
    expect(isSameDay(new Date(2025, 2, 30, 0, 30), new Date(2025, 2, 30, 23, 30))).toBe(true);
    expect(isSameDay(new Date(2025, 2, 30, 23, 59), new Date(2025, 2, 31, 0, 1))).toBe(false);
    expect(new Date(startOfDay(NOW)).getHours()).toBe(0);
  });

  it("caches a day without leaking the answer to the next one", () => {
    const at = (m: number, d: number) => new Date(2024, m - 1, d, 12).getTime();
    expect(isSameDay(at(3, 5), at(3, 5))).toBe(true);
    expect(isSameDay(at(7, 9), at(3, 5))).toBe(false);
    expect(isSameDay(at(3, 5), at(3, 5))).toBe(true);
    expect(isSameDay(NaN, NaN)).toBe(false);
  });

  it("labels today and yesterday, overridably", () => {
    expect(formatDay(NOW - 3600_000, {}, NOW)).toBe("Today");
    expect(formatDay(NOW - 86400_000, { yesterday: "Hier" }, NOW)).toBe("Hier");
    expect(formatDay(new Date(2020, 0, 1), {}, NOW)).toContain("2020");
  });

  it("names the coming days: tomorrow, then weekdays for the rest of the week", () => {
    expect(formatDay(NOW + 86400_000, { tomorrow: "Demain" }, NOW)).toBe("Demain");
    expect(formatDay(NOW + 3 * 86400_000, {}, NOW)).toBe(
      formatWeekday(NOW + 3 * 86400_000, "long"),
    );
    expect(formatDay(NOW + 7 * 86400_000, {}, NOW)).toContain("19");
  });

  it("reads a date-only string as that local day", () => {
    expect(formatDay("2025-09-12", {}, NOW)).toBe("Today");
    expect(formatDay("2025-09-11", {}, NOW)).toBe("Yesterday");
  });
});

describe("day keys", () => {
  it("writes the local day, and steps across months, years and DST", () => {
    expect(dayKey(new Date(2026, 0, 3, 23, 59))).toBe("2026-01-03");
    expect(dayKey("2026-01-03")).toBe("2026-01-03");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-03-28", "2026-04-02")).toBe(5);
    expect(daysBetween("2026-10-05", new Date(2026, 9, 1, 12))).toBe(-4);
  });

  it("formats a month and a weekday", () => {
    expect(formatMonth("2026-10-05")).toMatch(/October.*2026/);
    expect(formatWeekday("2026-10-05")).toMatch(/Mon/);
  });
});

describe("formatAbsolute", () => {
  it("passes an unreadable input back", () => {
    expect(formatAbsolute("soon")).toBe("soon");
    expect(formatAbsolute(NOW)).toContain("2025");
  });
});

describe("setTwentyFourHourClock", () => {
  const at = Date.UTC(2024, 2, 5, 17, 30);
  const shown = (hour12: boolean) =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12 }).format(at);

  it("switches every clock, and switches back", () => {
    try {
      setTwentyFourHourClock(true);
      expect(formatClock(at)).toBe(shown(false));
      setTwentyFourHourClock(false);
      expect(formatClock(at)).toBe(shown(true));
      setTwentyFourHourClock(true);
      expect(formatClock(at)).toBe(shown(false));
    } finally {
      setTwentyFourHourClock(undefined);
    }
  });
});

describe("formatDate", () => {
  it("prints a date at the precision it was written with", () => {
    expect(formatDate("2026-07-20", { style: "numeric", locale: "en-GB" })).toBe("20/07/2026");
    expect(formatDate("2026-07", { style: "long", locale: "en-GB" })).toBe("July 2026");
    expect(formatDate("2026", { locale: "en-GB" })).toBe("2026");
    expect(formatDate("2026-07-20", { style: "short", locale: "en-GB" })).toBe("20 Jul 2026");
  });

  it("keeps a calendar date on its day in every zone, and leaves text alone", () => {
    expect(formatDate("2026-01-01", { style: "numeric", locale: "en-GB" })).toBe("01/01/2026");
    expect(formatDate("2023 – 2024")).toBe("2023 – 2024");
    expect(formatDate(new Date(2026, 6, 20, 23, 30), { style: "numeric", locale: "en-GB" })).toBe(
      "20/07/2026",
    );
  });

  it("gives the datetime attribute to match", () => {
    expect(isoDate(" 2026-07 ")).toBe("2026-07");
    expect(isoDate("2023 – 2024")).toBe("");
    expect(isoDate(Date.UTC(2026, 6, 20))).toBe("2026-07-20T00:00:00.000Z");
  });
});

describe("parseTime", () => {
  it("reads the ways people type a time", () => {
    expect(parseTime("9")).toBe("09:00");
    expect(parseTime("930")).toBe("09:30");
    expect(parseTime("0930")).toBe("09:30");
    expect(parseTime(" 21:05 ")).toBe("21:05");
    expect(parseTime("9h30")).toBe("09:30");
    expect(parseTime("9.30pm")).toBe("21:30");
    expect(parseTime("12am")).toBe("00:00");
    expect(parseTime("12 PM")).toBe("12:00");
    expect(parseTime("5 p.m.")).toBe("17:00");
  });
  it("refuses what isn't one", () => {
    for (const bad of ["", "24:00", "9:60", "13pm", "noon", "9:3", "12345"])
      expect(parseTime(bad)).toBeNull();
  });
});
