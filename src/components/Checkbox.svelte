<script lang="ts">
  // The drawn `.checkbox`, with its label beside it when there is one.
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "type" | "checked" | "children"> {
    checked?: boolean;
    indeterminate?: boolean;
    /** Visible label text; `children` for richer content. Without either, pass `aria-label`. */
    label?: string;
    /** A second line under the label. */
    hint?: string;
    children?: Snippet;
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  }

  let {
    checked = $bindable(false),
    indeterminate = $bindable(false),
    label,
    hint,
    children,
    class: extra,
    ...rest
  }: Props = $props();
</script>

{#if label || children}
  <label class={["check-row", extra]}>
    <input type="checkbox" class="checkbox" bind:checked bind:indeterminate {...rest} />
    <span class="text">
      {#if children}{@render children()}{:else}{label}{/if}
      {#if hint}<span class="hint">{hint}</span>{/if}
    </span>
  </label>
{:else}
  <input type="checkbox" class={["checkbox", extra]} bind:checked bind:indeterminate {...rest} />
{/if}

<style>
  .check-row {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--gap-3);
    font-size: var(--fs-sm);
    color: var(--color);
    cursor: pointer;
  }
  .check-row .checkbox {
    margin-top: calc((1lh - var(--check)) / 2);
  }
  .text {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    min-width: 0;
  }
  .hint {
    font-size: var(--fs-xs);
    color: var(--muted);
  }
</style>
