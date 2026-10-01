<script lang="ts">
  // One demo on a hand-written page: a heading, a line on what it shows, the live thing, and
  // optionally the code for it.
  import type { Snippet } from "svelte";
  import { inlineCode } from "../lib/format";
  import CodeSnippet from "./CodeSnippet.svelte";

  interface Props {
    title: string;
    description?: string;
    code?: string;
    /** Lays the demo out as a plain block rather than a centred, wrapping row. */
    block?: boolean;
    children: Snippet;
  }

  const { title, description, code, block = false, children }: Props = $props();
</script>

<section>
  <h2>{title}</h2>
  {#if description}<p class="muted">{@html inlineCode(description)}</p>{/if}
  <div class="canvas" class:block>{@render children()}</div>
  {#if code}<div class="code"><CodeSnippet {code} /></div>{/if}
</section>

<style>
  section {
    margin-bottom: calc(var(--sp-5) * 3);
  }
  h2 {
    margin: 0 0 var(--sp-2);
    font-size: var(--fs-lg);
    font-weight: 600;
    color: var(--color2);
  }
  p {
    max-width: 75ch;
    margin: 0 0 var(--sp-4);
  }
  p :global(code) {
    font-family: var(--mono);
    font-size: 0.9em;
    color: var(--color2);
  }
  .canvas {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-4);
    min-width: 0;
    padding: calc(var(--sp-5) * 1.5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg);
    --ring-bg: var(--bg);
  }
  .canvas.block {
    display: block;
  }
  .code {
    margin-top: var(--sp-4);
  }
</style>
