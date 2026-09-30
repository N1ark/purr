<script lang="ts">
  // The title bar of a panel or dialog: icon, title, count, actions, close.
  import type { Component, Snippet } from "svelte";
  import XIcon from "phosphor-svelte/lib/XIcon";
  import IconButton from "./IconButton.svelte";

  interface Props {
    title: string;
    icon?: Component<{ size?: number | string }>;
    count?: number | string;
    /** Buttons before the close button. */
    actions?: Snippet;
    /** After the title, before the actions: a filter, a status. */
    children?: Snippet;
    onclose?: () => void;
    closeLabel?: string;
    /** Heading level of the title. */
    level?: 2 | 3 | 4;
  }

  const {
    title,
    icon: Icon,
    count,
    actions,
    children,
    onclose,
    closeLabel = "Close",
    level = 2,
  }: Props = $props();
</script>

<header class="panel-header">
  {#if Icon}<span class="icon"><Icon /></span>{/if}
  <svelte:element this={`h${level}`} class="title truncate">
    {title}
    {#if count !== undefined}<span class="count">{count}</span>{/if}
  </svelte:element>
  {@render children?.()}
  {#if actions || onclose}
    <div class="actions">
      {@render actions?.()}
      {#if onclose}
        <IconButton label={closeLabel} onclick={onclose}><XIcon /></IconButton>
      {/if}
    </div>
  {/if}
</header>

<style>
  .panel-header {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    flex: none;
    min-height: calc(var(--btn) + var(--sp-4));
    padding: 0 var(--sp-3) 0 var(--sp-4);
    border-bottom: 1px solid var(--border);
    color: var(--muted);
  }
  .icon {
    display: grid;
    font-size: var(--icon-md);
  }
  .title {
    flex: 1;
    margin: 0;
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--color2);
  }
  .count {
    margin-left: var(--gap-2);
    font-size: var(--fs-xs);
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: var(--gap-1);
    flex: none;
  }
</style>
