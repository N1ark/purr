<script lang="ts">
  // "Nothing here" and "nothing matches". `inline` is the compact line used inside a list.
  import type { Component, Snippet } from "svelte";

  interface Props {
    text?: string;
    hint?: string;
    icon?: Component<{ size?: number | string }>;
    inline?: boolean;
    /** Rich text in place of `text` (inline markdown, a link). */
    children?: Snippet;
    /** A way out under the text: "Clear filters", "Open a folder…". */
    action?: Snippet;
  }

  const { text, hint, icon: Icon, inline = false, children, action }: Props = $props();
</script>

<div class="empty" class:inline>
  {#if Icon && !inline}<span class="icon"><Icon /></span>{/if}
  <span class="text"
    >{#if children}{@render children()}{:else}{text}{/if}</span
  >
  {#if hint}<span class="hint">{hint}</span>{/if}
  {#if action && !inline}<div class="action">{@render action()}</div>{/if}
</div>

<style>
  .empty {
    display: grid;
    justify-items: center;
    gap: var(--gap-3);
    padding: calc(var(--sp-5) + var(--gap-1));
    font-size: var(--fs-sm);
    text-align: center;
    color: var(--muted);
  }
  .icon {
    display: grid;
    font-size: calc(var(--icon-lg) * 1.5);
    color: var(--faint);
  }
  .text {
    font-style: italic;
  }
  .empty.inline {
    display: block;
    padding: var(--gap-1) var(--gap-3);
    font-size: var(--fs-xs);
    text-align: left;
  }
  .hint {
    font-size: var(--fs-xs);
  }
  .action {
    margin-top: var(--gap-2);
  }
  .empty :global(code) {
    font-family: var(--mono);
    font-size: 0.9em;
  }
</style>
