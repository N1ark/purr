<script lang="ts" generics="T extends string">
  // Mutually exclusive options sharing one border.
  import type { Component } from "svelte";

  interface Option {
    id: T;
    label: string;
    /** A Phosphor (or purr) icon before the label. */
    icon?: Component<{ size?: number | string }>;
    disabled?: boolean;
  }

  interface Props {
    options: Option[];
    value: T;
    /** Accessible name of the group. */
    label: string;
    size?: "sm" | "md";
    onchange?: (id: T) => void;
  }

  let { options, value = $bindable(), label, size = "md", onchange }: Props = $props();

  function pick(id: T) {
    if (id === value) return;
    value = id;
    onchange?.(id);
  }
</script>

<div class={["segmented", size]} role="group" aria-label={label}>
  {#each options as option (option.id)}
    <button
      type="button"
      class:is-on={option.id === value}
      aria-pressed={option.id === value}
      disabled={option.disabled}
      onclick={() => pick(option.id)}
    >
      {#if option.icon}<option.icon />{/if}
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segmented {
    display: inline-flex;
    flex: none;
    border: 1px solid var(--control-border);
    border-radius: var(--radius);
    background: var(--control-bg);
    overflow: hidden;
  }
  button {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
    min-height: calc(var(--btn) - 2px);
    padding: var(--sp-1) var(--sp-4);
    font-size: var(--fs-sm);
    color: var(--muted);
    white-space: nowrap;
    transition:
      background-color var(--dur),
      color var(--dur);
  }
  .sm button {
    min-height: calc(var(--btn-md) - 2px);
    padding: 1px var(--sp-3);
    font-size: var(--fs-xs);
  }
  button + button {
    border-left: 1px solid var(--control-border);
  }
  button.is-on {
    background: var(--theme);
    color: var(--on-accent);
  }
  button:disabled {
    opacity: 0.5;
  }
  @media (hover: hover) {
    button:hover:not(.is-on, :disabled) {
      background: var(--control-hover);
      color: var(--color2);
    }
  }
</style>
