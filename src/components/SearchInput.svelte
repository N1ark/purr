<script lang="ts">
  // The filter at the top of a list. `bar` is a full-width row with a rule under it (a panel's
  // first line); `field` is a rounded box that sits among other controls.
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";
  import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlassIcon";
  import XIcon from "phosphor-svelte/lib/XIcon";
  import IconButton from "./IconButton.svelte";

  interface Props extends Omit<HTMLInputAttributes, "value" | "type" | "children"> {
    value: string;
    /** Accessible name; the placeholder is not one. */
    label: string;
    variant?: "bar" | "field";
    focusOnMount?: boolean;
    /** A clear button while there is text. */
    clearable?: boolean;
    clearLabel?: string;
    /** After the field: a filter toggle, a count. */
    trailing?: Snippet;
    /** The `<input>`, for callers that focus or select it. */
    input?: HTMLInputElement | null;
  }

  let {
    value = $bindable(),
    label,
    variant = "bar",
    focusOnMount = false,
    clearable = false,
    clearLabel = "Clear",
    trailing,
    input = $bindable(null),
    class: extra,
    ...rest
  }: Props = $props();

  $effect(() => {
    if (focusOnMount) input?.focus();
  });

  function clear() {
    value = "";
    input?.focus();
  }
</script>

<div class={["search", variant, extra]}>
  <MagnifyingGlassIcon />
  <input
    bind:this={input}
    bind:value
    type="text"
    aria-label={label}
    spellcheck="false"
    autocomplete="off"
    {...rest}
  />
  {#if clearable && value}
    <IconButton label={clearLabel} size="sm" tip={false} onclick={clear}><XIcon /></IconButton>
  {/if}
  {@render trailing?.()}
</div>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    flex: none;
    min-width: 0;
    font-size: var(--icon-md);
    color: var(--muted);
  }
  .bar {
    padding: var(--sp-2) var(--sp-4);
    border-bottom: 1px solid var(--border);
  }
  .field {
    min-height: var(--btn);
    padding: 0 var(--sp-1) 0 var(--sp-3);
    border: 1px solid var(--field-border);
    border-radius: var(--radius-pill);
    background: var(--field-bg);
    transition: border-color var(--dur);
  }
  .field:focus-within {
    border-color: var(--theme2);
  }
  input {
    flex: 1;
    min-width: 0;
    padding: var(--gap-1) 0;
    font-size: var(--fs-sm);
    color: var(--color2);
  }
</style>
