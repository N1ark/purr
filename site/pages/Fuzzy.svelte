<script lang="ts">
  import {
    EXACT,
    Highlight,
    PREFIX,
    SUBSEQUENCE,
    SUBSTRING,
    SearchInput,
    WORD_START,
    fuzzyMatch,
    highlightRuns,
    matchTier,
    matchesAny,
    rank,
    type Tier,
  } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  interface Entry {
    name: string;
    path: string;
  }

  const NAMES = [
    "ActionSheet",
    "Avatar",
    "AvatarStack",
    "Badge",
    "Banner",
    "Button",
    "Checkbox",
    "ColorGrid",
    "CommandPalette",
    "ConfirmButton",
    "ContextMenuHost",
    "DialogHost",
    "EmptyState",
    "IconButton",
    "Lightbox",
    "Menu",
    "Modal",
    "PanelHeader",
    "Popover",
    "SearchInput",
    "Segmented",
    "SettingsLayout",
    "ShortcutsOverlay",
    "Spinner",
    "Switch",
    "TextField",
    "ToastHost",
    "VirtualList",
  ];
  const ITEMS: Entry[] = [
    ...NAMES.map((name) => ({ name, path: `src/components/${name}.svelte` })),
    { name: "fuzzy.ts", path: "src/lib/fuzzy.ts" },
    { name: "keys.ts", path: "src/lib/keys.ts" },
    { name: "tooltip.ts", path: "src/actions/tooltip.ts" },
    { name: "tokens.css", path: "src/styles/tokens.css" },
  ];

  const TIERS: Record<Tier, string> = {
    [EXACT]: "EXACT",
    [PREFIX]: "PREFIX",
    [WORD_START]: "WORD_START",
    [SUBSTRING]: "SUBSTRING",
    [SUBSEQUENCE]: "SUBSEQUENCE",
  };

  let query = $state("sh");
  const hits = $derived(rank(ITEMS, query, { keys: [(i) => i.name, (i) => i.path], limit: 12 }));

  let needle = $state("sch");
  const SENTENCES = ["Design the Schema", "soteria-rust", "QuickSwitcher.svelte", "git dialog"];

  const fieldText = (entry: Entry, field: number) => (field === 0 ? entry.name : entry.path);
</script>

<PageHeader
  title="Fuzzy matching"
  description="One matcher for switchers and filters: tiered (exact, prefix, word start, substring, subsequence), with indices to highlight."
  importLine={`import { fuzzyMatch, rank, Highlight } from "purr";`}
  source="src/lib/fuzzy.ts"
/>

<Section
  title="rank"
  description="Component names, with paths as a second field, demoted a tier. An empty query keeps the order."
  code={`const hits = rank(items, query, {
  keys: [(i) => i.name, (i) => i.path],
  limit: 12,
});

{#each hits as hit (hit.item.path)}
  <Highlight text={hit.field === 0 ? hit.item.name : hit.item.path} indices={hit.indices} />
{/each}`}
  block
>
  <div class="s-stack">
    <div class="search">
      <SearchInput
        variant="field"
        label="Query"
        placeholder="Query…"
        bind:value={query}
        clearable
      />
    </div>
    <div class="scroll">
      <table class="s-table">
        <thead>
          <tr><th>match</th><th>tier</th><th>score</th><th>field</th></tr>
        </thead>
        <tbody>
          {#each hits as hit (hit.item.path)}
            {@const text = fieldText(hit.item, hit.field)}
            {@const tier = matchTier(query, text)}
            <tr>
              <td class="mono"><Highlight {text} indices={hit.indices} /></td>
              <td class="mono muted">{query.trim() && tier !== null ? TIERS[tier] : "—"}</td>
              <td class="mono tabular">{hit.score}</td>
              <td class="muted">{hit.field === 0 ? "name" : "path"}</td>
            </tr>
          {:else}
            <tr><td colspan="4" class="muted">Nothing matches “{query}”.</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</Section>

<Section
  title="fuzzyMatch"
  description="One string: null for a miss, else a score and indices. Camel humps count as word starts."
  code={`const m = fuzzyMatch("${needle}", "Design the Schema");
// ${JSON.stringify(fuzzyMatch(needle, "Design the Schema"))}`}
>
  <input class="field-input needle" bind:value={needle} aria-label="Fuzzy query" />
  {#each SENTENCES as text (text)}
    {@const m = fuzzyMatch(needle, text)}
    <span class="sentence" class:faint={!m}><Highlight {text} indices={m?.indices ?? []} /></span>
  {/each}
</Section>

<Section
  title="highlightRuns and matchesAny"
  description="`highlightRuns` splits text into matched runs for `Highlight`; `matchesAny` is a plain substring test."
  code={`highlightRuns("Schema", [0, 1, 2])
// ${JSON.stringify(highlightRuns("Schema", [0, 1, 2]))}
matchesAny("${needle}", "Design", "the Schema")  // ${matchesAny(needle, "Design", "the Schema")}`}
>
  {@const m = fuzzyMatch(needle, "Design the Schema")}
  {#each highlightRuns("Design the Schema", m?.indices ?? []) as run, i (i)}
    <span class="run" class:hit={run.hit}>{run.text}</span>
  {/each}
  <span class="muted"
    >· matchesAny: <span class="mono">{matchesAny(needle, "Design", "the Schema")}</span></span
  >
</Section>

<style>
  .search {
    max-width: 320px;
  }
  .scroll {
    max-height: 380px;
    overflow-y: auto;
  }
  .needle {
    width: 120px;
  }
  .run {
    padding: var(--gap-1) var(--gap-2);
    border: 1px dashed var(--border);
    border-radius: var(--radius-sm);
    font-family: var(--mono);
    white-space: pre;
  }
  .run.hit {
    border-style: solid;
    border-color: var(--theme2);
    color: var(--theme2);
  }
  .sentence {
    padding: var(--gap-2) var(--sp-3);
    border-radius: var(--radius);
    background: var(--bg2);
  }
</style>
