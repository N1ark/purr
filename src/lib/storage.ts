/**
 * `localStorage` that cannot throw: it is missing in a private window, full on a busy profile,
 * and unusable under Node's own global. Every read has a fallback; a failed write is dropped.
 */

/** A `Storage` held in memory, for tests and wherever the real one is unavailable. */
export function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}

function store(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function readString(key: string): string | null {
  try {
    return store()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string | null): void {
  try {
    if (value === null) store()?.removeItem(key);
    else store()?.setItem(key, value);
  } catch {
    // Quota or a locked-down profile: the value lives for this session only.
  }
}

/** The parsed value, or `fallback` when it is missing or unreadable; `check` rejects a stale shape. */
export function readJson<T>(key: string, fallback: T, check?: (value: unknown) => value is T): T {
  const raw = readString(key);
  if (raw === null) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    if (check && !check(value)) return fallback;
    return value as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  writeString(key, value === undefined ? null : JSON.stringify(value));
}

/** A `"1"`/`"0"` flag, the shape most UI toggles are stored in. */
export function readFlag(key: string, fallback: boolean): boolean {
  const raw = readString(key);
  return raw === null ? fallback : raw === "1";
}

export function writeFlag(key: string, on: boolean): void {
  writeString(key, on ? "1" : "0");
}
