<script lang="ts" module>
  export type { PaletteItem, RowState } from "./types";
</script>

<script lang="ts" generics="T extends PaletteItem">
  // The quick switcher and the command palette: a field over a fuzzy-ranked, windowed list of
  // items, walked with the arrows, chosen with ↩. On a phone it docks to the bottom edge with
  // the field last, and rides up with the keyboard.
  import type { Snippet } from "svelte";
  import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlassIcon";

  import { rank, type Ranked } from "../lib/fuzzy";
  import { isMobileLayout } from "../lib/platform";
  import Highlight from "./Highlight.svelte";
  import Kbd from "./Kbd.svelte";
  import Modal from "./Modal.svelte";
  import type { PaletteItem, RowState } from "./types";
  import VirtualList from "./VirtualList.svelte";

  interface Props {
    items: readonly T[];
    onclose: () => void;
    /** What the field holds; bind it to keep a query across openings. */
    query?: string;
    /** Replaces the built-in ranking, for a filter syntax (`#tag`) or a bounded cross-kind search. */
    search?: (query: string) => Ranked<T>[];
    /** Offered after the matches when it returns an item: "Create note ‘…’". */
    create?: (query: string) => T | null;
    /** Instead of `item.run`; the palette closes first either way. */
    onchoose?: (item: T, event: KeyboardEvent | MouseEvent) => void;
    /** At most this many results, ranked in one pass. */
    limit?: number;
    placeholder?: string;
    /** Names the dialog and the field. */
    label?: string;
    /** Shown when nothing matches; gets the query. */
    emptyText?: (query: string) => string;
    /** A whole row of your own; the default is icon, label, detail and hint. */
    row?: Snippet<[T, RowState]>;
    /** Before the field, in place of the magnifying glass. */
    leading?: Snippet;
    /** After the field: the shortcut that opened it, a mode switch. */
    trailing?: Snippet;
    /** Replaces the key hints along the bottom; `null` for none. */
    footer?: Snippet | null;
    navigateLabel?: string;
    chooseLabel?: string;
    rowHeight?: number;
    width?: string;
    offset?: string;
    scrim?: "normal" | "strong" | "frosted" | "none";
  }

  let {
    items,
    onclose,
    query = $bindable(""),
    search,
    create,
    onchoose,
    limit = 200,
    placeholder = "Type to search…",
    label = "Command palette",
    emptyText = (q) => (q.trim() ? `Nothing matches “${q.trim()}”.` : "Nothing here."),
    row,
    leading,
    trailing,
    footer,
    navigateLabel = "navigate",
    chooseLabel = "open",
    rowHeight = isMobileLayout() ? 44 : 30,
    width = "min(560px, calc(100vw - 32px))",
    offset = "12vh",
    scrim = "normal",
  }: Props = $props();

  const uid = $props.id();
  let active = $state(0);
  let list = $state<VirtualList<Ranked<T>> | null>(null);

  const results = $derived.by((): Ranked<T>[] => {
    const hits = search
      ? search(query)
      : rank(
          items.filter((item) => !item.disabled),
          query,
          {
            keys: [(i) => i.label, (i) => i.detail, (i) => i.keywords?.join(" ")],
            limit,
          },
        );
    const extra = query.trim() ? create?.(query.trim()) : null;
    return extra ? [...hits, { item: extra, score: 0, field: 0, indices: [] }] : hits;
  });

  $effect(() => {
    void results;
    active = 0;
    list?.scrollToIndex(0);
  });

  function choose(index: number, event: KeyboardEvent | MouseEvent) {
    const hit = results[index];
    if (!hit) return;
    onclose();
    if (onchoose) onchoose(hit.item, event);
    else hit.item.run?.(event);
  }

  function move(to: number) {
    if (!results.length) return;
    active = (to + results.length) % results.length;
    list?.scrollToIndex(active);
  }

  function onKeydown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey && !e.metaKey && !e.altKey;
    if (e.key === "ArrowDown" || (ctrl && e.key === "n")) move(active + 1);
    else if (e.key === "ArrowUp" || (ctrl && e.key === "p")) move(active - 1);
    else if (e.key === "PageDown") move(Math.min(results.length - 1, active + 8));
    else if (e.key === "PageUp") move(Math.max(0, active - 8));
    else if (e.key === "Enter" && !e.isComposing) choose(active, e);
    else return;
    e.preventDefault();
  }
</script>

<Modal {label} {onclose} align="top" {offset} {width} {scrim} mobile="sheet" class="palette">
  <div class="palette-body">
    <div class="field">
      <span class="lead">
        {#if leading}{@render leading()}{:else}<MagnifyingGlassIcon />{/if}
      </span>
      <input
        bind:value={query}
        onkeydown={onKeydown}
        {placeholder}
        aria-label={label}
        role="combobox"
        aria-expanded="true"
        aria-controls="{uid}-list"
        aria-activedescendant={results.length ? `${uid}-${active}` : undefined}
        aria-autocomplete="list"
        autocomplete="off"
        spellcheck="false"
        data-autofocus
      />
      {@render trailing?.()}
    </div>

    <div class="results">
      <VirtualList
        bind:this={list}
        items={results}
        {rowHeight}
        key={(hit) => hit.item.id}
        role="listbox"
        {label}
        id="{uid}-list"
        padding="var(--gap-2)"
      >
        {#snippet children(hit, index)}
          {@const state = { indices: hit.indices, field: hit.field, active: index === active }}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="option row-item"
            class:is-cursor={state.active}
            role="option"
            id="{uid}-{index}"
            tabindex="-1"
            aria-selected={state.active}
            aria-setsize={results.length}
            aria-posinset={index + 1}
            onpointermove={() => (active = index)}
            onmousedown={(e) => e.preventDefault()}
            onclick={(e) => choose(index, e)}
          >
            {#if row}
              {@render row(hit.item, state)}
            {:else}
              {@const item = hit.item}
              {#if item.icon}
                <span class="icon" style:color={item.iconColor}>
                  <item.icon {...item.iconProps} />
                </span>
              {/if}
              <span class="label truncate">
                <Highlight text={item.label} indices={hit.field === 0 ? hit.indices : []} />
              </span>
              {#if item.detail}
                <span class="detail truncate">
                  <Highlight text={item.detail} indices={hit.field === 1 ? hit.indices : []} />
                </span>
              {/if}
              {#if item.hint}<Kbd hint={item.hint} />{/if}
            {/if}
          </div>
        {/snippet}
        {#snippet empty()}
          <p class="empty">{emptyText(query)}</p>
        {/snippet}
      </VirtualList>
    </div>

    {#if footer !== null}
      <div class="foot">
        {#if footer}
          {@render footer()}
        {:else}
          <span><kbd>↑</kbd><kbd>↓</kbd> {navigateLabel}</span>
          <span><Kbd hint="↩" /> {chooseLabel}</span>
        {/if}
      </div>
    {/if}
  </div>
</Modal>

<style>
  .palette-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .field {
    display: flex;
    align-items: center;
    gap: var(--sp-4);
    flex: none;
    padding: var(--sp-3) var(--sp-5);
    border-bottom: 1px solid var(--border);
    color: var(--muted);
  }
  .lead {
    display: grid;
    font-size: var(--icon-lg);
  }
  input {
    flex: 1;
    min-width: 0;
    padding: var(--gap-2) 0;
    border: none;
    background: none;
    font-size: var(--fs-lg);
    color: var(--color2);
    outline: none;
  }
  .results {
    display: flex;
    flex-direction: column;
    flex: 0 1 auto;
    min-height: 0;
  }
  .option {
    height: 100%;
    gap: var(--sp-4);
    cursor: pointer;
  }
  .icon {
    display: grid;
    flex: none;
    font-size: var(--icon-md);
    color: var(--muted);
  }
  .label {
    flex: 0 1 auto;
    font-weight: 500;
  }
  /* The hint sits at the row's end, with or without a detail between. */
  .option > :global(.kbd) {
    margin-left: auto;
  }
  .detail {
    flex: 1 1 0;
    font-size: var(--fs-xs);
    color: var(--muted);
  }
  .empty {
    margin: 0;
    padding: var(--sp-5);
    text-align: center;
    font-size: var(--fs-sm);
    color: var(--muted);
  }
  .foot {
    display: flex;
    gap: var(--sp-5);
    flex: none;
    padding: var(--sp-2) var(--sp-5);
    border-top: 1px solid var(--border);
    font-size: var(--fs-micro);
    color: var(--muted);
  }
  .foot kbd {
    margin-right: var(--gap-1);
  }
  /* The field sits last, above the keyboard, with the results above the thumb. */
  :global(body.mobile) .palette-body {
    flex-direction: column-reverse;
  }
  :global(body.mobile) .field {
    border-top: 1px solid var(--border);
    border-bottom: none;
    padding-bottom: calc(var(--sp-3) + var(--safe-bottom));
    /* The one part that is not a scroller; a drag on it would take the shell with it. */
    touch-action: none;
  }
  :global(body.mobile) .foot {
    display: none;
  }
</style>
