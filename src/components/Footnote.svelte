<script lang="ts">
  // A footnote's text, with a link back to its `FootnoteRef`.
  import type { Snippet } from "svelte";

  interface Props {
    /** The `FootnoteRef`'s `id`. */
    id: string;
    children: Snippet;
    prefix?: string;
    backLabel?: string;
  }

  const { id, children, prefix = "fn", backLabel = "Back to the text" }: Props = $props();
</script>

<div class="footnote" id="{prefix}-{id}" role="note" aria-labelledby="{prefix}ref-{id}">
  <a class="back" href="#{prefix}ref-{id}" aria-label={backLabel} title={backLabel}
    >&#x21a9;&#xfe0e;</a
  >
  <div class="body">{@render children()}</div>
</div>

<style>
  .footnote {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--sp-4);
    margin: var(--md-block, var(--sp-4)) 0;
  }
  .back {
    color: inherit;
    text-decoration: none;
    transition: opacity var(--dur);
  }
  .footnote:target .back {
    color: var(--theme2);
  }
  .body > :global(:first-child) {
    margin-top: 0;
  }
  .body > :global(:last-child) {
    margin-bottom: 0;
  }
  @media (hover: hover) {
    .back:hover {
      opacity: 0.5;
      text-decoration: none;
    }
  }
</style>
