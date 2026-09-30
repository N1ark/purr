/**
 * The menu model every menu renders from — context menus, "…" buttons, action sheets — and the
 * one singleton a `ContextMenuHost` shows: `menu.show(event, [...entries], title)`.
 */

import type { Component, Snippet } from "svelte";

import type { Placement, Point, Rect } from "./position";

export interface MenuItem {
  label: string;
  /** A Phosphor (or any) icon component, rendered at the menu's icon size. */
  icon?: Component<any>;
  /** Extra props for `icon`, e.g. `{ weight: "fill" }` or an emoji component's `{ name }`. */
  iconProps?: Record<string, unknown>;
  /** A colour dot where the icon goes: a tag's or a stage's colour. */
  swatch?: string;
  /** A shortcut hint (`"⌘C"`), rendered by `Kbd`. */
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  /** A muted second line: why it is disabled, or what it will do. */
  note?: string;
  /** A check mark; `"mixed"` for a tag some of a selection carries. */
  checked?: boolean | "mixed";
  run?: () => void;
  /** Stays open after running, for toggles worked through in a row. */
  keepOpen?: boolean;
  /** Two presses: the first relabels the item to this, the second runs it. */
  confirm?: string;
  /** A submenu; an item with children ignores `run`. */
  items?: MenuEntry[];
}

/** A small heading over the entries that follow. */
export interface MenuHeading {
  kind: "heading";
  label: string;
}

/** A colour grid, for the one menu where a list of names would be useless. */
export interface MenuColors {
  kind: "colors";
  colors: readonly string[];
  selected?: string | null;
  pick: (color: string) => void;
  /** Adds a native colour picker for anything outside the palette. */
  custom?: (color: string) => void;
  /** Names the grid and the custom picker to a screen reader. */
  label?: string;
  customLabel?: string;
}

/**
 * Anything else — a tag input, an alignment grid — rendered from a snippet. Give its controls
 * `role="menuitem"` and the arrows walk them with the rest.
 */
export interface MenuCustom {
  kind: "custom";
  render: Snippet<[MenuControl]>;
}

export interface MenuControl {
  /** Closes the whole menu, the way running an item does. */
  close: () => void;
}

export type MenuSeparator = "separator";

export type MenuEntry = MenuItem | MenuHeading | MenuColors | MenuCustom | MenuSeparator;

export function isItem(entry: MenuEntry): entry is MenuItem {
  return entry !== "separator" && !("kind" in entry);
}

/** Entries can be conditional; `false`/`null`/`undefined` ones are dropped. */
export type MaybeEntry = MenuEntry | false | null | undefined;

const isSeparator = (e: MenuEntry | undefined) => e === "separator";
const isHeading = (e: MenuEntry | undefined) =>
  !!e && e !== "separator" && "kind" in e && e.kind === "heading";

/** Drops the falsy entries, and the separators and headings left dangling once they went. */
export function entries(...list: MaybeEntry[]): MenuEntry[] {
  const out: MenuEntry[] = [];
  for (const entry of list) {
    if (!entry) continue;
    const last = out.at(-1);
    if (isSeparator(entry) && (!last || isSeparator(last) || isHeading(last))) continue;
    // A heading straight after another heading has lost its entries.
    if (isHeading(entry) && isHeading(last)) out.pop();
    out.push(entry);
  }
  while (isSeparator(out.at(-1)) || isHeading(out.at(-1))) out.pop();
  return out;
}

/** Where a menu opens: at a point (a right-click) or hung off an element (a "…" button). */
export type MenuAnchor = Point | Rect | HTMLElement;

class MenuState {
  open = $state(false);
  anchor = $state.raw<MenuAnchor>({ x: 0, y: 0 });
  placement = $state<Placement>("point");
  /** Small heading, e.g. the message author or the channel name. */
  title = $state<string | null>(null);
  entries = $state.raw<MenuEntry[]>([]);
  /** Bumped per opening, so a closing animation cannot shut the menu that replaced it. */
  version = $state(0);

  #open(anchor: MenuAnchor, placement: Placement, list: MaybeEntry[], title?: string | null) {
    const items = entries(...list);
    if (!items.length) return false;
    this.anchor = anchor;
    this.placement = placement;
    this.title = title ?? null;
    this.entries = items;
    this.version++;
    this.open = true;
    return true;
  }

  /** From a `contextmenu` (or any mouse) event: suppresses the browser's menu and any menu above. */
  show(event: MouseEvent, list: MaybeEntry[], title?: string | null) {
    if (!this.#open({ x: event.clientX, y: event.clientY }, "point", list, title)) return;
    event.preventDefault();
    event.stopPropagation();
  }

  /** At a point with no event left, e.g. after an await or from a keyboard shortcut. */
  showAt(x: number, y: number, list: MaybeEntry[], title?: string | null) {
    this.#open({ x, y }, "point", list, title);
  }

  /** Hung off an element, a "…" button's menu. */
  showFor(
    element: HTMLElement,
    list: MaybeEntry[],
    title?: string | null,
    placement: Placement = "bottom-start",
  ) {
    this.#open(element, placement, list, title);
  }

  close(version?: number) {
    if (version !== undefined && version !== this.version) return;
    this.open = false;
    this.entries = [];
    this.title = null;
  }
}

export const menu = new MenuState();
