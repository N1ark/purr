<script lang="ts">
  // Every page, by group, with a fuzzy filter: Enter opens the best match.
  import { Highlight, SearchInput, rank } from "purr";
  import { GROUPS, PAGES, type Page } from "../pages";
  import { href, route } from "../lib/site.svelte";

  interface Props {
    /** The filter field, so `/` can focus it. */
    input?: HTMLInputElement | null;
  }

  let { input = $bindable(null) }: Props = $props();

  let query = $state("");

  const hits = $derived(
    rank(PAGES, query, {
      keys: [(p) => p.title, (p) => p.keywords?.join(" "), (p) => p.group],
    }),
  );

  const grouped = $derived(
    GROUPS.map((group) => ({ group, pages: PAGES.filter((p) => p.group === group) })),
  );

  function open(page: Page | undefined) {
    if (!page) return;
    location.hash = href(page.slug);
    query = "";
  }
</script>

<div class="side">
  <div class="filter">
    <SearchInput
      label="Filter pages"
      placeholder="Filter…"
      bind:value={query}
      bind:input
      clearable
      onkeydown={(e) => {
        if (e.key === "Enter") open(hits[0]?.item);
        else if (e.key === "Escape" && query) {
          e.stopPropagation();
          query = "";
        }
      }}
    />
  </div>
  <nav class="scroll" aria-label="Pages">
    {#if query.trim()}
      {#each hits as hit (hit.item.slug)}
        <a
          class="row-item"
          class:is-current={route.path === hit.item.slug}
          aria-current={route.path === hit.item.slug ? "page" : undefined}
          href={href(hit.item.slug)}
        >
          <span class="truncate fills"
            >{#if hit.field === 0}<Highlight
                text={hit.item.title}
                indices={hit.indices}
              />{:else}{hit.item.title}{/if}</span
          >
          <span class="faint group">{hit.item.group}</span>
        </a>
      {:else}
        <p class="none muted">No page matches “{query.trim()}”.</p>
      {/each}
    {:else}
      {#each grouped as { group, pages } (group)}
        <h2>{group}</h2>
        {#each pages as page (page.slug)}
          <a
            class="row-item"
            class:is-current={route.path === page.slug}
            aria-current={route.path === page.slug ? "page" : undefined}
            href={href(page.slug)}
          >
            <span class="truncate">{page.title}</span>
          </a>
        {/each}
      {/each}
    {/if}
  </nav>
</div>

<style>
  .side {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
  .filter {
    flex: none;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--sp-2) var(--sp-3) var(--sp-5);
  }
  h2 {
    margin: var(--sp-5) var(--sp-3) var(--sp-1);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--faint);
  }
  h2:first-child {
    margin-top: var(--sp-3);
  }
  a {
    text-decoration: none;
  }
  .group {
    flex: none;
    font-size: var(--fs-xs);
  }
  .none {
    padding: var(--sp-4);
    margin: 0;
    font-size: var(--fs-sm);
  }
</style>
