/**
 * A table of contents: the headings of a document, and how `TableOfContents` draws them. The
 * entries can come from anywhere (a markdown parser, a build step); `headingsIn` reads them off
 * rendered HTML.
 */

import { slugify } from "./util";

export interface TocItem {
  /** The heading's `id`, what a link to it points at. */
  id: string;
  title: string;
  /** 1 to 6, as in `h1`–`h6`. */
  level: number;
}

export interface TocRow extends TocItem {
  /** Steps in from the shallowest heading present, so a document of `h2`s starts at 0. */
  depth: number;
  /** The next entry is deeper: this one heads a run of children. */
  hasChildren: boolean;
  /** The previous entry was deeper: this one comes back out of a run. */
  afterChildren: boolean;
}

export function tocRows(items: readonly TocItem[]): TocRow[] {
  const top = items.reduce((min, item) => Math.min(min, item.level), Infinity);
  return items.map((item, i) => ({
    ...item,
    depth: item.level - top,
    hasChildren: i + 1 < items.length && items[i + 1].level > item.level,
    afterChildren: i > 0 && items[i - 1].level > item.level,
  }));
}

export interface HeadingsOptions {
  /** Which headings count; all six levels by default. */
  selector?: string;
  /** Headings to leave out: a card's title, the table's own. */
  ignore?: string;
  /** Gives a heading without an `id` one from its text (default true), so a link can reach it. */
  assignIds?: boolean;
}

const HEADINGS = "h1, h2, h3, h4, h5, h6";
const IGNORE = "nav *, .toc-ignore, [data-toc-ignore]";

/** `slugify(text)`, suffixed `-2`, `-3`… past any id the document already uses. */
export function uniqueSlug(text: string, doc: Document = document): string {
  const base = slugify(text) || "section";
  let id = base;
  for (let n = 2; doc.getElementById(id); n++) id = `${base}-${n}`;
  return id;
}

/** The headings under `root`, in document order. */
export function headingsIn(root: ParentNode, options: HeadingsOptions = {}): TocItem[] {
  const ignore = options.ignore ?? IGNORE;
  const doc = "ownerDocument" in root && root.ownerDocument ? root.ownerDocument : document;
  const items: TocItem[] = [];
  for (const heading of root.querySelectorAll<HTMLElement>(options.selector ?? HEADINGS)) {
    if (ignore && heading.matches(ignore)) continue;
    const title = (heading.textContent ?? "").trim().replace(/\s+/g, " ");
    if (!heading.id && options.assignIds !== false) heading.id = uniqueSlug(title, doc);
    if (!heading.id) continue;
    items.push({ id: heading.id, title, level: Number(heading.tagName.slice(1)) || 1 });
  }
  return items;
}
