/**
 * Dates as people read them, in the platform's locale. Every `Intl` formatter is built once and
 * kept: a row is a hot path, and constructing one per call is what this module exists to avoid.
 * Inputs are a `Date`, epoch milliseconds or an ISO string (Zulip's and git's seconds: `× 1000`).
 */

export type TimeInput = Date | number | string;

export function toDate(input: TimeInput): Date {
  return input instanceof Date ? input : new Date(input);
}

let hour12: boolean | undefined;
const formats = new Map<string, Intl.DateTimeFormat>();

function dateFormat(name: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  let fmt = formats.get(name);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(undefined, { ...options, hour12 });
    formats.set(name, fmt);
  }
  return fmt;
}

/** `true` for 14:30, `false` for 2:30 pm, `undefined` for the locale's own habit. */
export function setTwentyFourHourClock(on: boolean | undefined): void {
  const next = on === undefined ? undefined : !on;
  if (next === hour12) return;
  hour12 = next;
  formats.clear();
}

const CLOCK: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

/** `14:30`. */
export function formatClock(input: TimeInput): string {
  return dateFormat("clock", CLOCK).format(toDate(input));
}

/** `Friday 12 September 2025, 14:30`: the long form, for a tooltip. */
export function formatFull(input: TimeInput): string {
  return dateFormat("full", { dateStyle: "full", timeStyle: "short" }).format(toDate(input));
}

/** `12 Sept 2025, 14:30`: the locale's ordinary date and time. */
export function formatAbsolute(input: TimeInput): string {
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return dateFormat("absolute", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Someone else's local clock; null when the platform does not know the zone. */
export function formatClockIn(input: TimeInput, timeZone: string): string | null {
  try {
    const key = `clock:${timeZone}`;
    let fmt = formats.get(key);
    if (!fmt) {
      fmt = new Intl.DateTimeFormat(undefined, { ...CLOCK, hour12, timeZone });
      formats.set(key, fmt);
    }
    return fmt.format(toDate(input));
  } catch {
    return null;
  }
}

export type DateStyle = "numeric" | "short" | "long";

export interface DateOptions {
  /** `20/07/2026`, `20 Jul 2026` or `20 July 2026` (in `en-GB`); `short` by default. */
  style?: DateStyle;
  /** A BCP 47 tag; the platform's by default. A server-rendered page fixes one, or the server's
   *  locale and the reader's disagree and hydration rewrites every date. */
  locale?: string;
}

const DATE_FIELDS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  numeric: { day: "2-digit", month: "2-digit", year: "numeric" },
  short: { day: "numeric", month: "short", year: "numeric" },
  long: { day: "numeric", month: "long", year: "numeric" },
};

/**
 * A calendar date, at the precision it was written with: `"2026"` is a year, `"2026-07"` a
 * month and `"2026-07-20"` a day in every time zone, where `new Date()` would make each of them
 * a UTC midnight and show the day before west of Greenwich. Anything unreadable is returned as
 * it was given (`"2023 – 2024"`).
 */
export function formatDate(input: TimeInput, options: DateOptions = {}): string {
  const style = options.style ?? "short";
  const partial =
    typeof input === "string" ? /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(input.trim()) : null;
  const date = partial ? new Date(input as string) : toDate(input);
  if (Number.isNaN(date.getTime())) return String(input);
  const precision = !partial ? "day" : partial[3] ? "day" : partial[2] ? "month" : "year";
  const fields = { ...DATE_FIELDS[style] };
  if (precision !== "day") delete fields.day;
  if (precision === "year") delete fields.month;
  const key = `date:${style}:${precision}:${partial ? "utc" : ""}:${options.locale ?? ""}`;
  let fmt = formats.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(options.locale, {
      ...fields,
      timeZone: partial ? "UTC" : undefined,
    });
    formats.set(key, fmt);
  }
  return fmt.format(date);
}

/** The `datetime` attribute for `formatDate`'s input: the date as written, or an ISO string. */
export function isoDate(input: TimeInput): string {
  if (typeof input === "string" && /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(input.trim()))
    return input.trim();
  const date = toDate(input);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Midnight at the start of the local day: arithmetic will not do, a day is 23 or 25 hours twice a year. */
export function startOfDay(input: TimeInput): number {
  const d = new Date(toDate(input).getTime());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const msOf = (input: TimeInput) => (typeof input === "number" ? input : toDate(input).getTime());

/** The last day asked about: a list compares each row with its neighbour, mostly within a day. */
let dayStart = 0;
let dayEnd = 0;

export function isSameDay(a: TimeInput, b: TimeInput): boolean {
  const at = msOf(a);
  if (!(at >= dayStart && at < dayEnd)) {
    dayStart = startOfDay(at);
    const next = new Date(dayStart);
    next.setDate(next.getDate() + 1);
    dayEnd = next.getTime();
  }
  const other = msOf(b);
  return other >= dayStart && other < dayEnd;
}

export interface DayLabels {
  today?: string;
  yesterday?: string;
  tomorrow?: string;
}

/**
 * A day as people say it: Today / Yesterday / Tomorrow, the weekday for the rest of the coming
 * week (`Friday`), else `Fri 12 Sep` (with the year when it is not this one).
 */
export function formatDay(
  input: TimeInput,
  labels: DayLabels = {},
  now: TimeInput = Date.now(),
): string {
  const date = localDay(input);
  const ahead = daysBetween(now, date);
  if (ahead === 0) return labels.today ?? "Today";
  if (ahead === -1) return labels.yesterday ?? "Yesterday";
  if (ahead === 1) return labels.tomorrow ?? "Tomorrow";
  if (ahead > 1 && ahead < 7) return formatWeekday(date, "long");
  const sameYear = date.getFullYear() === localDay(now).getFullYear();
  return sameYear
    ? dateFormat("day", { weekday: "short", day: "numeric", month: "short" }).format(date)
    : dateFormat("dayYear", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `"2026-10-05"` is that day where the reader is, not a UTC midnight that is the 4th in America. */
function localDay(input: TimeInput): Date {
  const m = typeof input === "string" ? DAY_KEY.exec(input.trim()) : null;
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : toDate(input);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The local day as `YYYY-MM-DD`: a key that sorts, compares and survives a time-zone change. */
export function dayKey(input: TimeInput): string {
  const d = localDay(input);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The day `n` days after `input` (before, when negative), as a `dayKey`. */
export function addDays(input: TimeInput, n: number): string {
  const d = localDay(input);
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n));
}

/** Calendar days from `a` to `b`, whatever daylight saving does in between. */
export function daysBetween(a: TimeInput, b: TimeInput): number {
  const utc = (x: TimeInput) => {
    const d = localDay(x);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  };
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}

/** `Fri`, or `Friday` with `long`. */
export function formatWeekday(input: TimeInput, style: "short" | "long" = "short"): string {
  return dateFormat(`weekday:${style}`, { weekday: style }).format(localDay(input));
}

/** `October 2026`. */
export function formatMonth(input: TimeInput): string {
  return dateFormat("month", { month: "long", year: "numeric" }).format(localDay(input));
}

const relativeFormats = new Map<string, Intl.RelativeTimeFormat>();

function relativeFormat(style: Intl.RelativeTimeFormatStyle): Intl.RelativeTimeFormat {
  let fmt = relativeFormats.get(style);
  if (!fmt) {
    fmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto", style });
    relativeFormats.set(style, fmt);
  }
  return fmt;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86400],
  ["month", 30 * 86400],
  ["week", 7 * 86400],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export interface RelativeOptions {
  now?: TimeInput;
  /** `narrow` (5m ago), `short` (5 min. ago) or `long` (5 minutes ago). */
  style?: Intl.RelativeTimeFormatStyle;
  /** What anything under a minute reads as. */
  justNow?: string;
  /** Returned for an unreadable date. */
  invalid?: string;
}

/** `5m ago`, `in 2 days`, `just now`: in the locale, so the apps' catalogues need not carry it. */
export function formatRelative(input: TimeInput, options: RelativeOptions = {}): string {
  const ms = toDate(input).getTime();
  if (Number.isNaN(ms)) return options.invalid ?? "—";
  const seconds = (ms - toDate(options.now ?? Date.now()).getTime()) / 1000;
  const fmt = relativeFormat(options.style ?? "narrow");
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return fmt.format(Math.round(seconds / size), unit);
  }
  return options.justNow ?? "just now";
}
