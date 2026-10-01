<script lang="ts">
  import { ResizeEdge, draggedSize, resizer, toast } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let width = $state(220);
  let height = $state(120);
  let edgeWidth = $state(200);
  let commits = $state<string[]>([]);

  function commit(what: string, size: number) {
    commits = [`${what}: ${size}px`, ...commits].slice(0, 4);
  }
</script>

<PageHeader
  title="resizer"
  description="`use:resizer` turns any element into the drag handle of a pane: pointer capture so the drag survives leaving the strip, arrow keys (Shift for five steps), Home and End for the bounds, and a double-click or Enter back to `preset`. `ResizeEdge` is the usual way in; the action is for a handle of your own."
  importLine={`import { resizer, draggedSize } from "purr";`}
  source="src/actions/resize.ts"
/>

<Section
  title="A sidebar's edge"
  description="`side` says where the pane sits: a pane on the left grows as its right edge moves right. `onresize` fires through the drag, `oncommit` when it settles."
  code={`<aside style:width="{width}px">…</aside>
<div
  class="handle"
  role="separator"
  aria-orientation="vertical"
  tabindex="0"
  use:resizer={{
    side: "left",
    size: width,
    min: 140,
    max: 360,
    preset: 220,
    step: 10,
    onresize: (w) => (width = w),
    oncommit: (w) => save(w),
  }}
></div>`}
>
  <div class="panes">
    <aside style:width="{width}px">
      <span class="s-label">Sidebar</span>
      <span class="s-out">{width}px</span>
    </aside>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      class="handle x"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the sidebar"
      aria-valuenow={width}
      aria-valuemin={140}
      aria-valuemax={360}
      tabindex="0"
      use:resizer={{
        side: "left",
        size: width,
        min: 140,
        max: 360,
        preset: 220,
        step: 10,
        onresize: (w) => (width = w),
        oncommit: (w) => commit("width", w),
      }}
    ></div>
    <div class="main muted">Drag the bar, or focus it and use ← →; double-click resets</div>
  </div>
</Section>

<Section
  title="A bottom panel"
  description={'`side: "bottom"` for a panel docked below: it grows as its top edge moves up.'}
  code={`<div
  class="handle"
  use:resizer={{ side: "bottom", size: height, min: 60, max: 220, onresize: (h) => (height = h) }}
></div>`}
>
  <div class="column">
    <div class="main muted">Editor</div>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      class="handle y"
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize the panel"
      aria-valuenow={height}
      tabindex="0"
      use:resizer={{
        side: "bottom",
        size: height,
        min: 60,
        max: 220,
        preset: 120,
        onresize: (h) => (height = h),
        oncommit: (h) => commit("height", h),
      }}
    ></div>
    <div class="bottom" style:height="{height}px">
      <span class="s-label">Terminal</span>
      <span class="s-out">{height}px</span>
    </div>
  </div>
</Section>

<Section
  title="ResizeEdge"
  description="The component wraps the action in a strip on the pane's edge, with the separator role and values already set."
  code={`<aside style:width="{width}px" style:position="relative">
  <ResizeEdge
    size={width}
    side="left"
    label="Resize the sidebar"
    preset={200}
    onresize={(w) => (width = w)}
    oncommit={(w) => toast(\`Saved \${w}px\`)}
  />
</aside>`}
>
  <div class="panes">
    <aside class="edge" style:width="{edgeWidth}px">
      <span class="s-label">ResizeEdge</span>
      <span class="s-out">{edgeWidth}px</span>
      <ResizeEdge
        size={edgeWidth}
        side="left"
        label="Resize the sidebar"
        preset={200}
        onresize={(w) => (edgeWidth = w)}
        oncommit={(w) => toast(`Saved ${w}px`)}
      />
    </aside>
    <div class="main muted">Hover the edge</div>
  </div>
</Section>

<Section
  title="draggedSize"
  description="The pure part: the new size from the start size, the pointer's travel and the bounds."
  code={`draggedSize(220, 40, { side: "left" })   // ${draggedSize(220, 40, { side: "left" })}
draggedSize(220, 40, { side: "right" })  // ${draggedSize(220, 40, { side: "right" })}
draggedSize(220, 900, { side: "left" })  // ${draggedSize(220, 900, { side: "left" })} (DEFAULT_MAX)
draggedSize(220, -40, { side: "top", min: 200 }) // ${draggedSize(220, -40, { side: "top", min: 200 })}`}
>
  <div class="s-stack">
    <span class="s-label">Commits</span>
    {#each commits as line, i (i)}
      <span class="s-out">{line}</span>
    {:else}
      <span class="muted">Resize something above.</span>
    {/each}
  </div>
</Section>

<style>
  .panes {
    display: flex;
    width: 100%;
    height: 160px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  aside {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    flex: none;
    padding: var(--sp-4);
    background: var(--bg2);
  }
  aside.edge {
    border-right: 1px solid var(--border);
  }
  .main {
    flex: 1;
    display: grid;
    place-items: center;
    min-width: 0;
    padding: var(--sp-4);
    font-size: var(--fs-sm);
    text-align: center;
  }
  .handle {
    flex: none;
    background: var(--border);
    transition: background var(--dur) var(--ease);
  }
  .handle.x {
    width: 4px;
    cursor: col-resize;
  }
  .handle.y {
    height: 4px;
    cursor: row-resize;
  }
  .handle:focus-visible,
  .handle:global(.resizing) {
    background: var(--theme2);
    outline: none;
  }
  @media (hover: hover) {
    .handle:hover {
      background: var(--theme2);
    }
  }
  .column {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 300px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .bottom {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    flex: none;
    padding: var(--sp-4);
    background: var(--bg2);
  }
</style>
