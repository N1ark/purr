/** Transient notices, shown by one `ToastHost`: `toast("Copied")`, `toast.error(e)`. */

import { errorMessage } from "./util";

export type ToastKind = "info" | "success" | "error";

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  id: number;
  text: string;
  kind: ToastKind;
  action?: ToastAction;
}

export interface ToastOptions {
  kind?: ToastKind;
  /** Milliseconds on screen; 0 keeps it until dismissed. Errors stay longer by default. */
  timeout?: number;
  action?: ToastAction;
}

/** At most this many at once: the oldest makes way. */
const LIMIT = 4;

class Toasts {
  list = $state<Toast[]>([]);
  #nextId = 0;
  #timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(text: string, options: ToastOptions = {}): number {
    const kind = options.kind ?? "info";
    // The same notice twice replaces itself, rather than stacking an echo.
    const same = this.list.find((t) => t.text === text && t.kind === kind);
    if (same) this.dismiss(same.id);
    const id = ++this.#nextId;
    this.list = [...this.list, { id, text, kind, action: options.action }].slice(-LIMIT);
    const timeout = options.timeout ?? (kind === "error" ? 8000 : 3000);
    if (timeout > 0)
      this.#timers.set(
        id,
        setTimeout(() => this.dismiss(id), timeout),
      );
    return id;
  }

  dismiss(id: number): void {
    clearTimeout(this.#timers.get(id));
    this.#timers.delete(id);
    this.list = this.list.filter((t) => t.id !== id);
  }

  clear(): void {
    for (const timer of this.#timers.values()) clearTimeout(timer);
    this.#timers.clear();
    this.list = [];
  }
}

export const toasts = new Toasts();

/** Say something briefly; returns the id, for `toasts.dismiss`. */
export function toast(text: string, options?: ToastOptions): number {
  return toasts.show(text, options);
}

/** Whatever was thrown, as an error toast; logged too, since a toast is gone in seconds. */
toast.error = (error: unknown, options?: Omit<ToastOptions, "kind">): number => {
  console.error(error);
  return toasts.show(errorMessage(error), { ...options, kind: "error" });
};

toast.success = (text: string, options?: Omit<ToastOptions, "kind">): number =>
  toasts.show(text, { ...options, kind: "success" });
