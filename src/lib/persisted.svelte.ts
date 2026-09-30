import { readFlag, readJson, writeFlag, writeJson } from "./storage";

/**
 * A rune that survives a reload: `const open = persisted("app:minimap", true)`, then read and
 * assign `open.value`. Writes on assignment, so a nested mutation needs a fresh value assigned.
 */
export function persisted<T>(
  key: string,
  initial: T,
  check?: (value: unknown) => value is T,
): { value: T } {
  let value = $state(readJson(key, initial, check));
  return {
    get value() {
      return value;
    },
    set value(next: T) {
      value = next;
      writeJson(key, $state.snapshot(next));
    },
  };
}

/** `persisted` for a toggle kept as `"1"`/`"0"`, the shape apps stored their flags in before. */
export function persistedFlag(key: string, initial: boolean): { value: boolean } {
  let value = $state(readFlag(key, initial));
  return {
    get value() {
      return value;
    },
    set value(next: boolean) {
      value = next;
      writeFlag(key, next);
    },
  };
}
