<script lang="ts">
  // A page's title, what it is, how to import it and where its source lives.
  import { copyText, toast, tooltip } from "purr";
  import { ArrowSquareOut } from "purr/icons";
  import { inlineCode } from "../lib/format";
  import { sourceUrl } from "../lib/site.svelte";

  interface Props {
    title: string;
    /** Prose; backticks mark code. */
    description: string;
    /** `import { Button } from "purr";`, copied on click. */
    importLine?: string;
    /** A path in the repository. */
    source?: string;
  }

  const { title, description, importLine, source }: Props = $props();

  async function copyImport() {
    if (importLine && (await copyText(importLine))) toast("Copied the import");
  }
</script>

<header>
  <h1>{title}</h1>
  <p class="lead">{@html inlineCode(description)}</p>
  {#if importLine || source}
    <div class="meta">
      {#if importLine}
        <button type="button" class="import mono" onclick={copyImport} use:tooltip={"Copy"}>
          {importLine}
        </button>
      {/if}
      {#if source}
        <a class="btn btn--ghost btn--sm" href={sourceUrl(source)} target="_blank" rel="noreferrer">
          Source <ArrowSquareOut />
        </a>
      {/if}
    </div>
  {/if}
</header>

<style>
  header {
    margin-bottom: calc(var(--sp-5) * 2);
  }
  h1 {
    margin: 0 0 var(--sp-2);
    font-size: calc(var(--fs-xl) + 6px);
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--color2);
  }
  .lead {
    max-width: 70ch;
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-lg);
    color: var(--muted);
  }
  .lead :global(code) {
    font-family: var(--mono);
    font-size: 0.88em;
    color: var(--color2);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-4);
  }
  .import {
    padding: var(--gap-2) var(--sp-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--code-bg);
    color: var(--color2);
    font-size: var(--fs-sm);
    overflow-wrap: anywhere;
    text-align: left;
  }
  @media (hover: hover) {
    .import:hover {
      border-color: var(--border-strong);
    }
  }
</style>
