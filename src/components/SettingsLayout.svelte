<script lang="ts">
  // A settings screen: its sections down the side, the current one's pane beside it, set a shade
  // apart. On a phone the nav sits on top, its groups side by side. Place it in a flex column.
  import type { Snippet } from "svelte";
  import type { SettingsGroup } from "./types";

  interface Props {
    groups: readonly SettingsGroup[];
    /** The current section's id. */
    current: string;
    onselect?: (id: string) => void;
    /** The nav's accessible name. */
    label?: string;
    /** Heading level of the group headings. */
    level?: 2 | 3 | 4;
    navWidth?: string;
    /** Above the pane's scroll: a `PanelHeader` naming the section. */
    header?: Snippet;
    /** The current section's content. */
    children: Snippet;
  }

  let {
    groups,
    current = $bindable(),
    onselect,
    label = "Settings",
    level = 3,
    navWidth = "160px",
    header,
    children,
  }: Props = $props();

  function select(id: string) {
    current = id;
    onselect?.(id);
  }
</script>

<div class="settings-layout" style:--nav-w={navWidth}>
  <nav class="nav" aria-label={label}>
    {#each groups as group}
      <div class="group">
        {#if group.heading || group.label}
          <svelte:element this={`h${level}`} class="heading">
            {#if group.heading}{@render group.heading()}{:else}<span class="truncate"
                >{group.label}</span
              >{/if}
          </svelte:element>
        {/if}
        {#each group.sections as entry (entry.id)}
          {@const on = entry.id === current}
          <button
            type="button"
            class="row-item section"
            class:is-current={on}
            aria-current={on ? "page" : undefined}
            onclick={() => select(entry.id)}
          >
            {#if entry.icon}<span class="icon"><entry.icon /></span>{/if}
            <span class="truncate">{entry.label}</span>
            {#if entry.trailing}<span class="trailing">{@render entry.trailing()}</span>{/if}
          </button>
        {/each}
        {@render group.footer?.()}
      </div>
    {/each}
  </nav>

  <div class="pane">
    {@render header?.()}
    <div class="scroll">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .settings-layout {
    display: grid;
    grid-template-columns: var(--nav-w) minmax(0, 1fr);
    flex: 1;
    min-height: 0;
  }

  .nav {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: var(--sp-4) var(--sp-3);
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--bg2);
    border-right: 1px solid var(--border);
  }
  .group {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .group + .group {
    margin-top: var(--gap-4);
    padding-top: var(--gap-3);
    border-top: 1px solid var(--border);
  }
  .heading {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    min-width: 0;
    margin: 0 var(--sp-2) var(--sp-2);
    font-size: var(--fs-xs);
    font-weight: 600;
    color: var(--muted);
  }
  .section {
    gap: var(--sp-3);
    height: auto;
    min-height: calc(var(--btn) + var(--gap-1));
  }
  .section.is-current {
    font-weight: 500;
  }
  .icon {
    display: inline-flex;
    flex: none;
    font-size: var(--icon-md);
  }
  .trailing {
    display: inline-flex;
    flex: none;
    margin-left: auto;
    color: var(--muted);
  }

  /* Darker than the nav in the dark theme, lighter in the light one: either way, apart. */
  .pane {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background: var(--bg);
  }
  .scroll {
    flex: 1;
    min-height: 0;
    padding: var(--gap-3) var(--sp-5) var(--sp-5);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  :global(body.mobile) .settings-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
  :global(body.mobile) .nav {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    align-items: start;
    gap: 0 var(--gap-4);
    max-height: 38vh;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  :global(body.mobile) .group + .group {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
</style>
