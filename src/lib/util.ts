/** Small helpers that belong to no one module in particular. */

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * A heading's anchor: `"Où est l'été ?"` → `"ou-est-l-ete"`. Accents are folded rather than
 * dropped; anything else that is not a letter or a digit becomes one hyphen.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** A copy with the item at `from` moved to `to` (a position in the list without it). */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(clamp(to, 0, next.length), 0, item);
  return next;
}

/** The best `limit` items in order, in one pass: sorting twenty thousand to show eight is the cost. */
export function topK<T>(items: Iterable<T>, limit: number, order: (a: T, b: T) => number): T[] {
  if (limit <= 0) return [];
  const best: T[] = [];
  for (const item of items) {
    if (best.length === limit && order(item, best[best.length - 1]) >= 0) continue;
    let at = best.length;
    while (at > 0 && order(item, best[at - 1]) < 0) at--;
    best.splice(at, 0, item);
    if (best.length > limit) best.pop();
  }
  return best;
}

export interface Lru<K, V> {
  get(key: K): V | undefined;
  has(key: K): boolean;
  /** `weight` is what the entry costs against the budget; re-setting a key refreshes it. */
  set(key: K, value: V, weight?: number): void;
  delete(key: K): void;
  clear(): void;
}

/** Refreshing on read is the point: a FIFO evicts what was stored first, which is on screen. */
export function lruCache<K, V>(budget: number): Lru<K, V> {
  const entries = new Map<K, { value: V; weight: number }>();
  let total = 0;

  const drop = (key: K) => {
    const entry = entries.get(key);
    if (!entry) return;
    total -= entry.weight;
    entries.delete(key);
  };

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      entries.delete(key);
      entries.set(key, entry);
      return entry.value;
    },
    has: (key) => entries.has(key),
    set(key, value, weight = 1) {
      drop(key);
      entries.set(key, { value, weight });
      total += weight;
      for (const oldest of entries.keys()) {
        if (total <= budget || entries.size <= 1) break;
        drop(oldest);
      }
    },
    delete: drop,
    clear() {
      entries.clear();
      total = 0;
    },
  };
}

/** The message of whatever was thrown, for a toast: Tauri rejects with strings, fetch with Errors. */
export function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return String(error);
}
