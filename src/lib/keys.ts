/**
 * One shortcut model. A hint is written the way a Mac menu writes it — `⇧⌘K`, `⌥↓`, `↩`, `j` —
 * where `⌘` is the platform modifier (Ctrl off a Mac) and `⌃` is a literal Control. A chord is
 * its steps separated by a space: `g i`. The same string drives matching, display and help.
 */

import { hasOverlay } from "./overlays.svelte";
import { isMac } from "./platform";

/** What `matches` reads off a `KeyboardEvent`; a plain object in tests. */
export interface KeyLike {
  key: string;
  code?: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export interface Shortcut {
  /** Lowercased `KeyboardEvent.key`: `"k"`, `"enter"`, `"arrowdown"`, `"?"`, `" "`. */
  key: string;
  /** `⌘`: Meta or Ctrl. */
  mod: boolean;
  /** `⌃`: Ctrl itself. */
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

const NAMED: Record<string, string> = {
  "↩": "enter",
  "⏎": "enter",
  enter: "enter",
  return: "enter",
  esc: "escape",
  "⎋": "escape",
  escape: "escape",
  "⌫": "backspace",
  backspace: "backspace",
  "⌦": "delete",
  del: "delete",
  delete: "delete",
  "⇥": "tab",
  tab: "tab",
  "←": "arrowleft",
  "→": "arrowright",
  "↑": "arrowup",
  "↓": "arrowdown",
  space: " ",
  "␣": " ",
  pgup: "pageup",
  "⇞": "pageup",
  pgdn: "pagedown",
  "⇟": "pagedown",
  home: "home",
  "↖": "home",
  end: "end",
  "↘": "end",
};

const MODIFIER_GLYPHS = /^[⌘⇧⌥⌃]+/;
const MODIFIER_KEYS = new Set(["shift", "meta", "control", "alt", "altgraph", "capslock", "fn"]);

/** Splits a chord into its steps; a lone `" "` step would be ambiguous, so write `Space`. */
export function shortcutSteps(hint: string): string[] {
  return hint.trim().split(/\s+/).filter(Boolean);
}

/** One step of a hint; throws on nothing but a modifier. */
export function parseShortcut(step: string): Shortcut {
  const mods = MODIFIER_GLYPHS.exec(step)?.[0] ?? "";
  const rest = step.slice(mods.length);
  if (!rest) throw new Error(`a shortcut needs a key: ${step}`);
  const lower = rest.toLowerCase();
  return {
    key: NAMED[lower] ?? NAMED[rest] ?? lower,
    mod: mods.includes("⌘"),
    ctrl: mods.includes("⌃"),
    shift: mods.includes("⇧"),
    alt: mods.includes("⌥"),
  };
}

const LETTER = /^[a-z]$/;
const ALNUM = /^[a-z0-9]$/;

/** Does `event` press the single-step shortcut `hint`? `⌘` accepts Ctrl as well as ⌘. */
export function matches(hint: string, event: KeyLike): boolean {
  const steps = shortcutSteps(hint);
  if (steps.length !== 1) return false;
  const want = parseShortcut(steps[0]);
  const pressed = event.key.toLowerCase();

  // ⌥ turns a letter into a symbol on a Mac, so only then does the physical key stand in.
  const byCode =
    event.altKey &&
    ALNUM.test(want.key) &&
    (event.code === `Key${want.key.toUpperCase()}` || event.code === `Digit${want.key}`);
  if (pressed !== want.key && !byCode) return false;

  if (want.alt !== event.altKey) return false;
  // `?` or `*` is already shifted: Shift only counts where the key itself does not imply it.
  const shiftImplied = want.key.length === 1 && !LETTER.test(want.key) && !/^[0-9]$/.test(want.key);
  if (!(shiftImplied && !want.shift) && want.shift !== event.shiftKey) return false;

  if (want.mod && want.ctrl) return event.metaKey && event.ctrlKey;
  if (want.mod) return event.metaKey || event.ctrlKey;
  if (want.ctrl) return event.ctrlKey && !event.metaKey;
  return !event.metaKey && !event.ctrlKey;
}

export interface FormatOptions {
  /** Glyphs (`⇧⌘K`) or words (`Ctrl+Shift+K`); the running platform's by default. */
  mac?: boolean;
}

const MAC_KEYS: Record<string, string> = {
  enter: "↩",
  escape: "Esc",
  tab: "⇥",
  backspace: "⌫",
  delete: "⌦",
  " ": "Space",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  arrowdown: "↓",
  pageup: "PgUp",
  pagedown: "PgDn",
  home: "Home",
  end: "End",
};

const PC_KEYS: Record<string, string> = {
  ...MAC_KEYS,
  enter: "Enter",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Del",
};

function keyLabel(s: Shortcut, written: string, table: Record<string, string>): string {
  if (table[s.key]) return table[s.key];
  if (/^f\d{1,2}$/.test(s.key)) return s.key.toUpperCase();
  // A bare `j` stays lower case, as help screens write it; with a modifier it is a menu's `K`.
  const bare = !s.mod && !s.ctrl && !s.alt && !s.shift;
  return bare ? written : s.key.toUpperCase();
}

/** One formatted string per step: `["⇧⌘K"]` on a Mac, `["Ctrl+Shift+K"]` elsewhere. */
export function shortcutParts(hint: string, options: FormatOptions = {}): string[] {
  const mac = options.mac ?? isMac;
  return shortcutSteps(hint).map((step) => {
    let s: Shortcut;
    try {
      s = parseShortcut(step);
    } catch {
      return step;
    }
    const written = step.replace(MODIFIER_GLYPHS, "");
    if (mac) {
      const mods = `${s.ctrl ? "⌃" : ""}${s.alt ? "⌥" : ""}${s.shift ? "⇧" : ""}${s.mod ? "⌘" : ""}`;
      return mods + keyLabel(s, written, MAC_KEYS);
    }
    const parts: string[] = [];
    if (s.mod || s.ctrl) parts.push("Ctrl");
    if (s.alt) parts.push("Alt");
    if (s.shift) parts.push("Shift");
    parts.push(keyLabel(s, written, PC_KEYS));
    return parts.join("+");
  });
}

/** The hint as this platform writes it, chord steps separated by a space. */
export function formatShortcut(hint: string, options: FormatOptions = {}): string {
  return shortcutParts(hint, options).join(" ");
}

const ACCEL_KEYS: Record<string, string> = {
  enter: "Enter",
  escape: "Escape",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  " ": "Space",
  arrowleft: "Left",
  arrowright: "Right",
  arrowup: "Up",
  arrowdown: "Down",
  pageup: "PageUp",
  pagedown: "PageDown",
  home: "Home",
  end: "End",
};

/** `"⇧⌘Z"` → `"CmdOrCtrl+Shift+Z"`, Tauri's accelerator syntax; undefined for a chord. */
export function accelerator(hint?: string): string | undefined {
  if (!hint) return undefined;
  const steps = shortcutSteps(hint);
  if (steps.length !== 1) return undefined;
  const s = parseShortcut(steps[0]);
  const parts: string[] = [];
  if (s.mod) parts.push("CmdOrCtrl");
  if (s.ctrl) parts.push("Ctrl");
  if (s.alt) parts.push("Alt");
  if (s.shift) parts.push("Shift");
  parts.push(ACCEL_KEYS[s.key] ?? s.key.toUpperCase());
  return parts.join("+");
}

const TEXT_INPUTS = new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color"]);

/** A field taking the keystroke: plain shortcuts stand aside for it. */
export function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== "string") return false;
  if (el.tagName === "INPUT") return !TEXT_INPUTS.has((el as HTMLInputElement).type);
  return el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable === true;
}

/** For a field's own Escape (clearing a filter): handles it and keeps it from the overlay stack. */
export function onEscape(event: KeyboardEvent, handler: () => void): void {
  if (event.key !== "Escape" || event.isComposing) return;
  event.stopPropagation();
  event.preventDefault();
  handler();
}

// ---- keymaps ----

export interface Binding<A extends string = string> {
  /** A hint: `"⌘K"`, `"j"`, `"⇧E"`, or a chord `"g i"`. */
  keys: string;
  action: A;
  label: string;
  /** The heading it is listed under in the help. */
  group?: string;
  /** An alias the help leaves out. Bindings sharing an action and label are one row anyway. */
  hidden?: boolean;
  /** Fires while a field is being typed into; by default only `⌘`/`⌃` ones do. */
  typing?: boolean;
  /** Fires while an overlay is open; by default only `⌘`/`⌃` ones do. */
  overlay?: boolean;
}

export interface KeyContext {
  /** The chord prefix already pressed, if any. */
  chord: string | null;
  typing: boolean;
  overlay: boolean;
}

export type Resolution<A extends string = string> =
  | { kind: "action"; action: A; binding: Binding<A> }
  | { kind: "chord"; prefix: string }
  | { kind: "none" };

const NONE = { kind: "none" } as const;

function hasModifier(hint: string): boolean {
  return /[⌘⌃]/.test(hint);
}

function allowed(binding: Binding<string>, ctx: KeyContext): boolean {
  const global = hasModifier(binding.keys);
  if (ctx.typing && !(binding.typing ?? global)) return false;
  if (ctx.overlay && !(binding.overlay ?? global)) return false;
  return true;
}

/** What a keypress means, given what is open and what was pressed before it. Pure. */
export function resolveKey<A extends string>(
  bindings: readonly Binding<A>[],
  press: KeyLike,
  ctx: KeyContext,
): Resolution<A> {
  if (MODIFIER_KEYS.has(press.key.toLowerCase())) return NONE;

  if (ctx.chord) {
    const prefix = ctx.chord;
    const hit = bindings.find((b) => {
      const steps = shortcutSteps(b.keys);
      return (
        steps.length === 2 && steps[0] === prefix && matches(steps[1], press) && allowed(b, ctx)
      );
    });
    return hit ? { kind: "action", action: hit.action, binding: hit } : NONE;
  }

  for (const b of bindings) {
    const steps = shortcutSteps(b.keys);
    if (steps.length === 2 && matches(steps[0], press) && allowed(b, ctx)) {
      return { kind: "chord", prefix: steps[0] };
    }
  }

  const hit = bindings.find((b) => matches(b.keys, press) && allowed(b, ctx));
  return hit ? { kind: "action", action: hit.action, binding: hit } : NONE;
}

export interface HelpEntry {
  label: string;
  /** Hints, one per key that does it: render each with `Kbd`. */
  hints: string[];
}

export interface HelpGroup {
  title: string;
  entries: HelpEntry[];
}

export interface HelpOptions {
  /** Heading order; groups not named come after, in the order they first appear. */
  groups?: readonly string[];
  /** Rows for keys handled where they are pressed (the composer's ⌘B), listed only. */
  extra?: readonly (HelpEntry & { group?: string })[];
  /** Heading for bindings without a group. */
  ungrouped?: string;
}

/** The table as the `?` overlay shows it: bindings sharing an action and label fold into one row. */
export function helpGroups<A extends string>(
  bindings: readonly Binding<A>[],
  options: HelpOptions = {},
): HelpGroup[] {
  const ungrouped = options.ungrouped ?? "General";
  const groups = new Map<string, HelpEntry[]>();
  for (const title of options.groups ?? []) groups.set(title, []);
  const rows = new Map<string, HelpEntry>();

  for (const b of bindings) {
    if (b.hidden) continue;
    const title = b.group ?? ungrouped;
    const id = `${title}\u0000${b.action}\u0000${b.label}`;
    const row = rows.get(id);
    if (row) {
      row.hints.push(b.keys);
      continue;
    }
    const entry = { label: b.label, hints: [b.keys] };
    rows.set(id, entry);
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title)!.push(entry);
  }
  for (const e of options.extra ?? []) {
    const title = e.group ?? ungrouped;
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title)!.push({ label: e.label, hints: [...e.hints] });
  }
  return [...groups]
    .map(([title, entries]) => ({ title, entries }))
    .filter((g) => g.entries.length > 0);
}

export interface Keymap<A extends string> {
  readonly bindings: readonly Binding<A>[];
  /**
   * The window's keydown: resolves, runs, and prevents the default of what it handled. `run`
   * returning `false` means there was nothing to act on, and the key goes on to the browser.
   */
  handle(event: KeyboardEvent, run: (action: A, event: KeyboardEvent) => boolean | void): boolean;
  /** A click or a view change is a fresh start; a half-typed chord should not outlive it. */
  clearChord(): void;
  help(options?: HelpOptions): HelpGroup[];
}

/** How long the second key of a chord is waited for. */
const CHORD_MS = 1500;

export function createKeymap<A extends string>(bindings: readonly Binding<A>[]): Keymap<A> {
  let pending: string | null = null;
  let pendingAt = 0;

  return {
    bindings,
    handle(event, run) {
      if (event.defaultPrevented || event.isComposing) return false;
      const chord = pending && event.timeStamp - pendingAt < CHORD_MS ? pending : null;
      const resolved = resolveKey(bindings, event, {
        chord,
        typing: isTyping(event.target),
        overlay: hasOverlay(),
      });
      if (resolved.kind === "none" && MODIFIER_KEYS.has(event.key.toLowerCase())) return false;
      if (resolved.kind === "chord") {
        pending = resolved.prefix;
        pendingAt = event.timeStamp;
        event.preventDefault();
        return true;
      }
      pending = null;
      if (resolved.kind === "none") return false;
      if (run(resolved.action, event) === false) return false;
      event.preventDefault();
      return true;
    },
    clearChord() {
      pending = null;
    },
    help: (options) => helpGroups(bindings, options),
  };
}
