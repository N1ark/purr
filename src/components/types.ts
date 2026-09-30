/**
 * Types the components take, in a plain module: a type exported from a `.svelte` file resolves
 * for `svelte-check` but not for an app's type-aware ESLint, which sees only `*.svelte`'s shim.
 */

import type { Component } from "svelte";

/** `PresenceDot`, `Avatar`. */
export type Presence = "active" | "idle" | "offline";

/** One entry of a `CommandPalette`. */
export interface PaletteItem {
  id: string;
  label: string;
  /** Muted text after the label, matched one tier below it. */
  detail?: string;
  icon?: Component<any>;
  iconProps?: Record<string, unknown>;
  /** Tints the icon: a channel's or a tag's colour. */
  iconColor?: string;
  /** A shortcut hint, rendered by `Kbd`. */
  hint?: string;
  /** More text to match on, never shown. */
  keywords?: readonly string[];
  /** Left out of the results. */
  disabled?: boolean;
  /** What choosing it does; the event says whether ⌘ was held (open in a new window). */
  run?: (event: KeyboardEvent | MouseEvent) => void;
}

/** What a `CommandPalette` row snippet is told about its row. */
export interface RowState {
  /** Matched indices in the field that matched: the label (`field` 0) or the detail (1). */
  indices: number[];
  field: number;
  active: boolean;
}

/** One picture, video or sound in a `Lightbox`. */
export interface LightboxItem {
  src: string;
  kind?: "image" | "video" | "audio";
  /** Alt text, and the caption when there is no `caption`. */
  alt?: string;
  caption?: string;
  /** A muted line under the caption: a size, a date. */
  detail?: string;
}
