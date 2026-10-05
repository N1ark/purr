import { dayKey } from "./time";

/** A cell of a month's grid. */
export interface CalendarDay {
  /** `YYYY-MM-DD`, as `dayKey` writes it. */
  key: string;
  /** Day of the month. */
  date: number;
  /** False for the days of the months before and after that fill the first and last week. */
  inMonth: boolean;
}

/** The six weeks a month is shown in (`month` 0-based, as `Date` counts), from `weekStart` (0 = Sunday). */
export function monthGrid(year: number, month: number, weekStart = 1): CalendarDay[] {
  const lead = (new Date(year, month, 1).getDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(year, month, 1 - lead + i);
    return {
      key: dayKey(d),
      date: d.getDate(),
      inMonth: d.getMonth() === ((month % 12) + 12) % 12,
    };
  });
}

/** The first day of the week where the reader is (0 = Sunday), Monday when the platform can't say. */
export function firstWeekday(locale?: string): number {
  try {
    const tag = locale ?? (typeof navigator === "undefined" ? undefined : navigator.language);
    if (!tag) return 1;
    // `getWeekInfo()` in newer engines, the `weekInfo` getter in older ones.
    const loc = new Intl.Locale(tag) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    return ((loc.getWeekInfo?.() ?? loc.weekInfo)?.firstDay ?? 1) % 7;
  } catch {
    return 1;
  }
}
