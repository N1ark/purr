<script lang="ts">
  // A document's headings as a rail of links, nested by level. Where it sits (a sticky column, a
  // panel) is the page's; `headingsIn` reads the entries off rendered HTML.
  import type { Snippet } from "svelte";

  import { tocRows, type TocItem } from "../lib/toc";

  interface Props {
    items: readonly TocItem[];
    /** A visible heading over the list. */
    title?: string;
    /** The nav's accessible name; `title` when not given. */
    label?: string;
    /** The `id` of the section being read, marked as the current location. */
    current?: string;
    /** For a page that scrolls something other than the window: jump there, then `preventDefault`. */
    onselect?: (item: TocItem, e: MouseEvent) => void;
    /** Replaces an entry's text, e.g. with rendered inline markdown. */
    entry?: Snippet<[TocItem]>;
  }

  const { items, title, label = "Table of contents", current, onselect, entry }: Props = $props();

  const rows = $derived(tocRows(items));
</script>

<nav class="toc" aria-label={title ?? label}>
  {#if title}
    <p class="title">{title}</p>
  {/if}
  <ol>
    {#each rows as row, i (`${row.id}:${i}`)}
      <li
        class:has-children={row.hasChildren}
        class:after-children={row.afterChildren}
        class:is-current={row.id === current}
        style:--depth={row.depth}
      >
        <a
          href="#{row.id}"
          aria-current={row.id === current ? "location" : undefined}
          onclick={onselect && ((e) => onselect(row, e))}
          >{#if entry}{@render entry(row)}{:else}{row.title}{/if}</a
        >
      </li>
    {/each}
  </ol>
</nav>

<style>
  .toc {
    --toc-indent: 0.4em;
    min-width: 0;
  }
  .title {
    margin: 0 0 var(--sp-4);
    font-size: var(--toc-title-size, var(--fs-lg));
    font-weight: 650;
    line-height: 1.25;
    color: var(--color2);
  }
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    /* Deeper rows paint over the rail of the row above them; kept inside the list. */
    isolation: isolate;
  }
  /* One rail per level: each row draws its stretch of it, and a parent closes its own with a
     corner before its children start theirs. */
  li {
    position: relative;
    z-index: var(--depth);
    margin: -2px 0 0 calc(var(--toc-indent) * (var(--depth) + 1));
    padding: var(--sp-2) 0 var(--gap-2) var(--sp-4);
    border: 0 solid var(--border);
    border-left-width: 2px;
    /* Whatever the list sits on; a row's fill is what hides the rail of the row it overlaps. */
    background: var(--toc-bg, var(--bg));
    transition: border-color var(--dur);
  }
  li.has-children {
    border-bottom-width: 2px;
    border-bottom-left-radius: var(--radius);
  }
  li.after-children {
    border-top-width: 2px;
  }
  li.is-current {
    border-left-color: var(--theme2);
  }
  a {
    display: inline-block;
    color: inherit;
    text-decoration: none;
    transition: transform var(--dur-slow) var(--ease);
  }
  .is-current > a {
    color: var(--theme2);
  }
  @media (hover: hover) {
    li:hover {
      border-left-color: var(--color);
    }
    a:hover {
      text-decoration: none;
      transform: translateX(4px);
    }
  }
</style>
