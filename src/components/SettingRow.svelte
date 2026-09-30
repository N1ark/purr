<script lang="ts">
  // One setting: its name and explanation on the left, the control (`children`) on the right.
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    /** A line of explanation under the label. */
    sub?: string;
    /** The control goes under the label, for controls that need the width. */
    stack?: boolean;
    /** The control's id, so clicking the label reaches it. */
    for?: string;
    disabled?: boolean;
    children: Snippet;
  }

  const { label, sub, stack = false, for: htmlFor, disabled = false, children }: Props = $props();
</script>

<div class="row" class:stack class:disabled>
  <label class="name" for={htmlFor}>
    {label}
    {#if sub}<span class="sub">{sub}</span>{/if}
  </label>
  <div class="control">{@render children()}</div>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: var(--sp-5);
    padding: var(--sp-3) 0;
  }
  /* Rows are separate instances, so each draws the rule above itself. */
  .row + :global(.row) {
    border-top: 1px solid var(--border);
  }
  .row.stack {
    flex-direction: column;
    align-items: stretch;
    gap: var(--sp-3);
  }
  .row.disabled {
    opacity: 0.55;
  }
  .name {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    flex: 1;
    min-width: 0;
    font-size: var(--fs-sm);
    color: var(--color2);
  }
  .sub {
    font-size: var(--fs-xs);
    line-height: 1.4;
    color: var(--muted);
  }
  .control {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    flex: none;
    min-width: 0;
  }
  .stack .control {
    flex: auto;
  }
</style>
