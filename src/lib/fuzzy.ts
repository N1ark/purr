/**
 * One ranking for every filterable list, so the same query orders the same way everywhere:
 * exact > prefix > word start > substring > subsequence, and within a tier the earlier, tighter,
 * shorter match wins. Matches carry the matched indices for highlighting.
 */

/** Tiers, best first. */
export const EXACT = 0;
export const PREFIX = 1;
export const WORD_START = 2;
export const SUBSTRING = 3;
export const SUBSEQUENCE = 4;
export type Tier = 0 | 1 | 2 | 3 | 4;

const TIERS = 5;
/** Each tier is worth this much more than the next, so no in-tier bonus can cross it. */
export const TIER_WEIGHT = 1000;

export interface Match {
  /** Higher is better; comparable across candidates for the same query. */
  score: number;
  tier: Tier;
  /** Positions of the matched characters in the candidate, ascending. */
  indices: number[];
}

/** What a regex `\b` counts as a word character: letters, digits, underscore — and any non-ASCII letter. */
function isWordChar(code: number): boolean {
  return (
    (code >= 97 && code <= 122) ||
    (code >= 65 && code <= 90) ||
    (code >= 48 && code <= 57) ||
    code === 95 ||
    code > 127
  );
}

function isWordStart(hay: string, at: number): boolean {
  return at === 0 || !isWordChar(hay.charCodeAt(at - 1)) || isCamelHump(hay, at);
}

/** `qs` finds `QuickSwitcher`: a capital after a lower-case letter starts a word too. */
function isCamelHump(hay: string, at: number): boolean {
  const c = hay.charCodeAt(at);
  const p = hay.charCodeAt(at - 1);
  return c >= 65 && c <= 90 && p >= 97 && p <= 122;
}

function range(from: number, length: number): number[] {
  return Array.from({ length }, (_, i) => from + i);
}

const inTier = (tier: Tier, bonus: number) =>
  (TIERS - tier) * TIER_WEIGHT + Math.max(0, Math.min(TIER_WEIGHT - 1, bonus));

/** Both lowered, `original` kept for word starts; null for a miss. */
function score(original: string, hay: string, needle: string, withIndices: boolean): Match | null {
  const n = needle.length;
  const len = Math.min(hay.length, 400);
  if (hay === needle) return { score: inTier(EXACT, 999), tier: EXACT, indices: range(0, n) };
  if (hay.startsWith(needle)) {
    return {
      score: inTier(PREFIX, 999 - len),
      tier: PREFIX,
      indices: withIndices ? range(0, n) : [],
    };
  }

  let at = hay.indexOf(needle);
  if (at >= 0) {
    const first = at;
    for (; at >= 0; at = hay.indexOf(needle, at + 1)) {
      if (isWordStart(original, at)) {
        return {
          score: inTier(WORD_START, 999 - Math.min(at, 100) * 4 - len),
          tier: WORD_START,
          indices: withIndices ? range(at, n) : [],
        };
      }
    }
    return {
      score: inTier(SUBSTRING, 999 - Math.min(first, 100) * 4 - len),
      tier: SUBSTRING,
      indices: withIndices ? range(first, n) : [],
    };
  }

  // Greedy subsequence, taking a word start for each character where one comes next.
  const indices: number[] = [];
  let pos = 0;
  let bonus = 999 - len;
  for (let i = 0; i < n; i++) {
    const ch = needle[i];
    let found = -1;
    let plain = -1;
    for (let j = pos; j < hay.length; j++) {
      if (hay[j] !== ch) continue;
      if (plain < 0) plain = j;
      if (isWordStart(original, j)) {
        found = j;
        break;
      }
    }
    if (found < 0) found = plain;
    if (found < 0) return null;
    if (indices.length) bonus -= (found - indices[indices.length - 1] - 1) * 3;
    else bonus -= found * 3;
    if (isWordStart(original, found)) bonus += 15;
    indices.push(found);
    pos = found + 1;
  }
  return {
    score: inTier(SUBSEQUENCE, bonus),
    tier: SUBSEQUENCE,
    indices: withIndices ? indices : [],
  };
}

const lower = (text: string) => text.toLowerCase();

/** Match `query` against `text`; null is a miss, and an empty query matches everything at the top. */
export function fuzzyMatch(query: string, text: string): Match | null {
  const needle = lower(query.trim());
  if (!needle) return { score: TIERS * TIER_WEIGHT, tier: EXACT, indices: [] };
  if (text.length < needle.length) return null;
  return score(text, lower(text), needle, true);
}

/** The score alone (null for a miss), with no index array built: for ranking thousands. */
export function matchScore(query: string, text: string): number | null {
  const needle = lower(query.trim());
  if (!needle) return TIERS * TIER_WEIGHT;
  if (text.length < needle.length) return null;
  const hay = lower(text);
  // The cheapest honest rejection, and it rejects most of a big list.
  if (!hay.includes(needle[0])) return null;
  return score(text, hay, needle, false)?.score ?? null;
}

/** The tier alone (null for a miss), for a list that orders by tier and then by its own rule. */
export function matchTier(query: string, text: string): Tier | null {
  const s = matchScore(query, text);
  return s === null ? null : ((TIERS - Math.floor(s / TIER_WEIGHT)) as Tier);
}

export interface Ranked<T> {
  item: T;
  score: number;
  /** Which of `keys` matched best: 0 for the label, 1 for the first secondary field… */
  field: number;
  /** Indices within that field, for highlighting it. */
  indices: number[];
}

export interface RankOptions<T> {
  /** The fields matched, most important first; each later one is demoted by a whole tier. */
  keys: readonly ((item: T) => string | null | undefined)[];
  /** Keep only the best `limit`, in one pass rather than sorting everything. */
  limit?: number;
  /** Order among equal scores; the input order otherwise. */
  tieBreak?: (a: T, b: T) => number;
}

/**
 * The items matching `query`, best first. An empty query keeps the input order (up to `limit`).
 * Indices are computed only for the survivors.
 */
export function rank<T>(items: Iterable<T>, query: string, options: RankOptions<T>): Ranked<T>[] {
  const { keys, limit = Infinity, tieBreak } = options;
  const needle = query.trim();
  const out: Ranked<T>[] = [];

  if (!needle) {
    for (const item of items) {
      if (out.length >= limit) break;
      out.push({ item, score: TIERS * TIER_WEIGHT, field: 0, indices: [] });
    }
    return out;
  }

  const before = (a: Ranked<T>, b: Ranked<T>) =>
    a.score !== b.score ? a.score > b.score : tieBreak ? tieBreak(a.item, b.item) < 0 : false;

  for (const item of items) {
    let best: Ranked<T> | null = null;
    for (let f = 0; f < keys.length; f++) {
      const text = keys[f](item);
      if (!text) continue;
      const s = matchScore(needle, text);
      if (s === null) continue;
      const demoted = s - f * TIER_WEIGHT;
      if (!best || demoted > best.score) best = { item, score: demoted, field: f, indices: [] };
    }
    if (!best) continue;
    if (out.length >= limit && !before(best, out[out.length - 1])) continue;
    let at = out.length;
    while (at > 0 && before(best, out[at - 1])) at--;
    out.splice(at, 0, best);
    if (out.length > limit) out.pop();
  }

  for (const hit of out) {
    const text = keys[hit.field](hit.item) ?? "";
    hit.indices = fuzzyMatch(needle, text)?.indices ?? [];
  }
  return out;
}

export interface Run {
  text: string;
  hit: boolean;
}

/** Splits `text` into plain and matched runs for rendering `indices` highlighted. */
export function highlightRuns(text: string, indices: readonly number[]): Run[] {
  if (!indices.length) return text ? [{ text, hit: false }] : [];
  const set = new Set(indices);
  const out: Run[] = [];
  for (let i = 0; i < text.length; i++) {
    const hit = set.has(i);
    const last = out[out.length - 1];
    if (last && last.hit === hit) last.text += text[i];
    else out.push({ text: text[i], hit });
  }
  return out;
}

/** For boxes that narrow a list rather than rank it: a plain substring test on any field. */
export function matchesAny(query: string, ...fields: (string | null | undefined)[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field?.toLowerCase().includes(needle) === true);
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
}

/** `localeCompare` builds a collator per call, which is most of the cost of sorting a big list. */
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export function byName(a: string, b: string): number {
  return collator.compare(a, b);
}
