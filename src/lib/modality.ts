/** Whether the last input was a key rather than a pointer, for things a mouse user shouldn't see. */

let keyed = false;

if (typeof document !== "undefined") {
  // Capturing, so a handler that opens a menu on this very event already reads the new value.
  document.addEventListener("keydown", () => (keyed = true), true);
  document.addEventListener("pointerdown", () => (keyed = false), true);
}

export function usingKeyboard(): boolean {
  return keyed;
}
