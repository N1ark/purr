<script lang="ts" generics="T">
  // Renders only the rows on screen. Heights are known up front — one number, or one per row —
  // which keeps the maths and the scrollbar honest and means nothing is ever measured.
  import type { Snippet } from "svelte";

  import { fixedRange, offsets, rowAt, variableRange } from "../lib/virtual";

  interface Props {
    items: readonly T[];
    /** Every row's height in px, or each row's own. */
    rowHeight: number | ((item: T, index: number) => number);
    /** Rows kept beyond the viewport, so scrolling does not flash empty. */
    overscan?: number;
    /** Without it the keys are positions, and state inside a row follows the position. */
    key?: (item: T, index: number) => string | number;
    /** An ancestor that scrolls instead of the list: it lays out in full and windows against that. */
    scroller?: HTMLElement | null;
    /** Inset for the rows, so an overlay scrollbar does not sit on them. */
    padding?: string;
    /**
     * Names the list and makes each row a list item that says where in the whole list it sits.
     * Leave it off where a row is not one item (a grid of emoji).
     */
    label?: string;
    /** `listbox` leaves the rows' roles to the snippet, whose options carry setsize/posinset. */
    role?: "list" | "listbox";
    id?: string;
    children: Snippet<[T, number]>;
    empty?: Snippet;
  }

  const {
    items,
    rowHeight,
    overscan = 6,
    key,
    scroller = null,
    padding,
    label,
    role = "list",
    id,
    children,
    empty,
  }: Props = $props();

  let viewport = $state<HTMLElement | null>(null);
  let runway = $state<HTMLElement | null>(null);
  let top = $state(0);
  let height = $state(400);

  const fixed = $derived(typeof rowHeight === "number" ? rowHeight : null);
  const tops = $derived(
    typeof rowHeight === "function" ? offsets(items.length, (i) => rowHeight(items[i], i)) : null,
  );
  const total = $derived(tops ? tops[items.length] : items.length * (fixed ?? 0));

  const range = $derived.by((): [number, number] => {
    if (fixed !== null) return fixedRange(items.length, fixed, top, height, overscan);
    if (!tops) return [0, 0];
    const average = items.length ? total / items.length : 0;
    return variableRange(tops, top, height, overscan * average);
  });
  const offsetOf = (index: number) => (tops ? tops[index] : index * (fixed ?? 0));
  const heightOf = (index: number) => (tops ? tops[index + 1] - tops[index] : (fixed ?? 0));
  const slice = $derived(items.slice(range[0], range[1]));
  const named = $derived(label !== undefined && role === "list");

  /** Only a change of the first rendered row is worth a render: a trackpad scrolls far faster. */
  function update(nextTop: number, nextHeight: number) {
    if (nextHeight !== height) height = nextHeight;
    const now = fixed !== null ? Math.floor(nextTop / fixed) : tops ? rowAt(tops, nextTop) : 0;
    const was = fixed !== null ? Math.floor(top / fixed) : tops ? rowAt(tops, top) : 0;
    if (now !== was || nextHeight !== height) top = nextTop;
  }

  // Read in the scroll event itself: the new rows are in the DOM before the frame paints.
  function onScroll(e: Event & { currentTarget: HTMLElement }) {
    update(e.currentTarget.scrollTop, e.currentTarget.clientHeight);
  }

  $effect(() => {
    const box = scroller;
    const list = runway;
    if (!box || !list) return;
    // Measured, not read off `scrollTop`: the blocks above this list move it inside the box.
    const follow = () =>
      update(
        Math.max(0, box.getBoundingClientRect().top - list.getBoundingClientRect().top),
        box.clientHeight,
      );
    follow();
    box.addEventListener("scroll", follow, { passive: true });
    // Folding a block above, or resizing the window, moves the list without a scroll event.
    const observer = new ResizeObserver(follow);
    observer.observe(box);
    observer.observe(list);
    return () => {
      box.removeEventListener("scroll", follow);
      observer.disconnect();
    };
  });

  $effect(() => {
    const box = viewport;
    if (scroller || !box) return;
    const observer = new ResizeObserver(() => update(box.scrollTop, box.clientHeight));
    observer.observe(box);
    return () => observer.disconnect();
  });

  // A shrinking list must not leave the viewport scrolled past its end.
  $effect(() => {
    const max = Math.max(0, total - height);
    if (!scroller && viewport && viewport.scrollTop > max) {
      viewport.scrollTop = max;
      top = max;
    }
  });

  /** Brings row `index` into view, the least distance needed (or to the top/centre). */
  export function scrollToIndex(index: number, align: "nearest" | "start" | "center" = "nearest") {
    const box = scroller ?? viewport;
    if (!box || index < 0 || index >= items.length) return;
    const rowTop = offsetOf(index);
    const rowBottom = rowTop + heightOf(index);
    // Where the runway starts inside the box that scrolls, which is not always its offset parent.
    const base =
      scroller && runway
        ? runway.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
        : 0;
    const viewTop = box.scrollTop - base;
    let next = viewTop;
    if (align === "start") next = rowTop;
    else if (align === "center") next = rowTop - (box.clientHeight - heightOf(index)) / 2;
    else if (rowTop < viewTop) next = rowTop;
    else if (rowBottom > viewTop + box.clientHeight) next = rowBottom - box.clientHeight;
    if (next !== viewTop) box.scrollTop = next + base;
  }
</script>

{#snippet rows()}
  <!-- Only a window of the rows is in the DOM, so each one says how long the list really is
       and where it sits in it. -->
  <div
    class="runway"
    bind:this={runway}
    {id}
    role={named ? "list" : role === "listbox" ? "listbox" : undefined}
    aria-label={label}
    style:height="{total}px"
  >
    {#each slice as item, i (key ? key(item, range[0] + i) : range[0] + i)}
      {@const index = range[0] + i}
      <div
        class="row"
        role={named ? "listitem" : undefined}
        aria-setsize={named ? items.length : undefined}
        aria-posinset={named ? index + 1 : undefined}
        style:height="{heightOf(index)}px"
        style:transform="translateY({offsetOf(index)}px)"
      >
        {@render children(item, index)}
      </div>
    {/each}
  </div>
{/snippet}

{#if scroller}
  {#if items.length === 0}
    {@render empty?.()}
  {:else}
    {@render rows()}
  {/if}
{:else}
  <div class="viewport" bind:this={viewport} style:padding onscroll={onScroll}>
    {#if items.length === 0}
      {@render empty?.()}
    {:else}
      {@render rows()}
    {/if}
  </div>
{/if}

<style>
  .viewport {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
  }
  .runway {
    position: relative;
    flex: none;
    contain: layout paint;
  }
  .row {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
  }
</style>
