<script lang="ts">
  // Every icon `purr/icons` exports, searchable and windowed; each module loads when its row
  // first scrolls into view.
  import {
    Chip,
    ColorGrid,
    EmptyState,
    SearchInput,
    Segmented,
    Switch,
    VirtualList,
    copyText,
    rank,
    toast,
  } from "purr";
  import { MagnifyingGlass } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import CodeSnippet from "../components/CodeSnippet.svelte";
  import IconCell from "./icons/IconCell.svelte";
  import { ICONS, type IconEntry } from "./icons/icons";

  const WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"] as const;
  type Weight = (typeof WEIGHTS)[number];
  const SIZES = ["16", "20", "24", "32", "48"] as const;
  const COLORS = ["var(--theme2)", "var(--danger)", "var(--success)", "var(--info)", "var(--warn)"];
  const OWN_COUNT = ICONS.filter((i) => i.own).length;

  let query = $state("");
  let onlyOwn = $state(false);
  let size = $state<(typeof SIZES)[number]>("24");
  let weight = $state<Weight>("regular");
  let color = $state<string | null>(null);
  let mirrored = $state(false);
  let copyAs = $state<"import" | "tag">("import");

  let grid = $state<HTMLElement | null>(null);
  let scroller = $state<HTMLElement | null>(null);
  let width = $state(0);

  const hits = $derived(
    rank(onlyOwn ? ICONS.filter((i) => i.own) : ICONS, query.replace(/\s+/g, " "), {
      keys: [(i) => i.name, (i) => i.words],
    }),
  );

  const px = $derived(Number(size));
  const cellWidth = $derived(Math.max(104, px + 72));
  const rowHeight = $derived(px + 56);
  const columns = $derived(Math.max(1, Math.floor(width / cellWidth)));
  const rows = $derived.by(() => {
    const out: (typeof hits)[] = [];
    for (let i = 0; i < hits.length; i += columns) out.push(hits.slice(i, i + columns));
    return out;
  });

  // The page scrolls in the app's `<main>`, so the list windows against that.
  $effect(() => {
    const node = grid;
    if (!node) return;
    scroller = node.closest("main");
    const observer = new ResizeObserver(() => (width = node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  });

  const tag = (name: string) => {
    const props = [
      size !== "24" && `size={${size}}`,
      weight !== "regular" && `weight="${weight}"`,
      color && `color="${color}"`,
      mirrored && "mirrored",
    ].filter(Boolean);
    return `<${[name, ...props].join(" ")} />`;
  };
  const importOf = (name: string) => `import { ${name} } from "purr/icons";`;

  async function pick(icon: IconEntry) {
    const text = copyAs === "import" ? importOf(icon.name) : tag(icon.name);
    if (await copyText(text)) toast(`Copied ${text}`);
    else toast.error("Couldn't reach the clipboard");
  }
</script>

<PageHeader
  title="Icons"
  description={`All of Phosphor plus ${OWN_COUNT} of purr's own, drawn in the same style and taking the same props (\`size\`, \`weight\`, \`color\`, \`mirrored\`). Each is exported with and without the \`Icon\` suffix; the \`purr()\` plugin turns the import into a per-file one and cuts the weights an app does not use. Click an icon to copy it.`}
  importLine={importOf("Gear")}
  source="src/icons/index.ts"
/>

<div class="usage">
  <CodeSnippet
    code={`${importOf("Gear")}

<Gear />                     <!-- 1em, so it follows the text or the button -->
<Gear size={20} weight="bold" color="var(--theme2)" />

// vite.config.ts: only the weights the app uses
purr({ weights: ["regular", "bold", "fill"] })`}
  />
</div>

<div class="toolbar">
  <div class="search">
    <SearchInput
      variant="field"
      label="Search icons"
      placeholder="Search {ICONS.length} icons…"
      bind:value={query}
      clearable
    />
    <span class="muted count tabular"
      >{hits.length === ICONS.length ? `${ICONS.length} icons` : `${hits.length} match`}</span
    >
  </div>
  <div class="options">
    <Chip label="purr's own ({OWN_COUNT})" on={onlyOwn} onclick={() => (onlyOwn = !onlyOwn)} />
    <Segmented
      label="Size"
      size="sm"
      options={SIZES.map((id) => ({ id, label: id }))}
      bind:value={size}
    />
    <Segmented
      label="Weight"
      size="sm"
      options={WEIGHTS.map((id) => ({ id, label: id }))}
      bind:value={weight}
    />
    <ColorGrid
      label="Colour"
      colors={COLORS}
      value={color}
      auto
      autoLabel="currentColor"
      custom
      columns={7}
      onpick={(c) => (color = c)}
      oncustominput={(c) => (color = c)}
    />
    <Switch label="Mirrored" bind:checked={mirrored} />
    <span class="muted small">Mirrored</span>
    <Segmented
      label="Copy as"
      size="sm"
      options={[
        { id: "import", label: "Copy import" },
        { id: "tag", label: "Copy tag" },
      ]}
      bind:value={copyAs}
    />
  </div>
</div>

<div class="browser" bind:this={grid}>
  {#if scroller}
    <VirtualList
      items={rows}
      {rowHeight}
      {scroller}
      overscan={3}
      key={(row) => `${columns}:${row[0]?.item.name}`}
    >
      {#snippet children(row)}
        <div class="cells" style:grid-template-columns="repeat({columns}, minmax(0, 1fr))">
          {#each row as hit (hit.item.name)}
            <IconCell
              icon={hit.item}
              indices={hit.field === 0 ? hit.indices : []}
              size={px}
              {weight}
              color={color ?? "currentColor"}
              {mirrored}
              onpick={pick}
            />
          {/each}
        </div>
      {/snippet}
      {#snippet empty()}
        <EmptyState
          icon={MagnifyingGlass}
          text="No icon matches “{query.trim()}”"
          hint="Phosphor names things plainly: try “arrow”, “chat” or “git”."
        />
      {/snippet}
    </VirtualList>
  {/if}
</div>

<style>
  .usage {
    margin-bottom: calc(var(--sp-5) * 2);
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    margin: 0 calc(var(--sp-5) * -1);
    padding: var(--sp-4) var(--sp-5);
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }
  .search {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
  }
  .search > :global(.search) {
    flex: 1;
    max-width: 420px;
  }
  .count {
    font-size: var(--fs-sm);
    white-space: nowrap;
  }
  .options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-3) var(--sp-5);
  }
  .small {
    margin-left: calc(var(--sp-4) * -1);
    font-size: var(--fs-sm);
  }
  .browser {
    padding-top: var(--sp-4);
  }
  .cells {
    display: grid;
    width: 100%;
    height: 100%;
    gap: var(--gap-2);
  }
</style>
