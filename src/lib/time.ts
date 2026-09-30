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
}

/** A date separator: Today / Yesterday / `Fri 12 Sep` (with the year when it is not this one). */
export function formatDay(
  input: TimeInput,
  labels: DayLabels = {},
  now: TimeInput = Date.now(),
): string {
  const day = startOfDay(input);
  const today = startOfDay(now);
  if (day === today) return labels.today ?? "Today";
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  if (day === d.getTime()) return labels.yesterday ?? "Yesterday";
  const date = toDate(input);
  const sameYear = date.getFullYear() === toDate(now).getFullYear();
  return sameYear
    ? dateFormat("day", { weekday: "short", day: "numeric", month: "short" }).format(date)
    : dateFormat("dayYear", { day: "numeric", month: "short", year: "numeric" }).format(date);
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
