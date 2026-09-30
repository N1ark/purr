/** Focus management for dialogs: keep Tab inside, and put focus somewhere useful on open. */

import type { Action } from "svelte/action";

const FOCUSABLE = [
  "a[href]",
  "button:not(:disabled)",
  "input:not(:disabled):not([type=hidden])",
  "select:not(:disabled)",
  "textarea:not(:disabled)",
  "[contenteditable]:not([contenteditable=false])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** What Tab can reach inside `root`, in order; hidden elements left out. */
export function focusables(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[inert]") && (el.offsetParent !== null || el.getClientRects().length > 0),
  );
}

/** Tab and Shift+Tab wrap around inside the node. */
export const focusTrap: Action<HTMLElement, boolean | undefined> = (node, enabled = true) => {
  let on = enabled !== false;
  function onKeydown(e: KeyboardEvent) {
    if (!on || e.key !== "Tab") return;
    const all = focusables(node);
    if (!all.length) {
      e.preventDefault();
      node.focus();
      return;
    }
    const first = all[0];
    const last = all[all.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === node)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
  node.addEventListener("keydown", onKeydown);
  return {
    update(next) {
      on = next !== false;
    },
    destroy() {
      node.removeEventListener("keydown", onKeydown);
    },
  };
};

export interface AutofocusOptions {
  /** Select the field's text too, for a rename. */
  select?: boolean;
  /** Skip it, e.g. on a phone, where focusing raises the keyboard over what was tapped. */
  enabled?: boolean;
}

/** Focuses the node once it is on screen; `preventScroll`, or WebKit scrolls a shell that never moved. */
export const autofocus: Action<HTMLElement, AutofocusOptions | undefined> = (node, options) => {
  if (options?.enabled === false) return;
  const frame = requestAnimationFrame(() => {
    node.focus({ preventScroll: true });
    if (
      options?.select &&
      (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)
    ) {
      node.select();
    }
  });
  return {
    destroy() {
      cancelAnimationFrame(frame);
    },
  };
};

/**
 * Remembers what had focus and gives it back later, unless something else has claimed it since:
 * an entry that opens a dialog or puts the cursor in a field has already decided.
 */
export function rememberFocus(): () => void {
  const previous = document.activeElement;
  return () => {
    queueMicrotask(() => {
      const now = document.activeElement;
      if (now && now !== document.body && now.isConnected) return;
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus({ preventScroll: true });
    });
  };
}
