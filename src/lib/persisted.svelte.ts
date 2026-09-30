import { readJson, writeJson } from "./storage";

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
