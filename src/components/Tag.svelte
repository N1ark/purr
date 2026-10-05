<script lang="ts">
  // A small capsule label: a note's tag in its colour, or furniture ("BOT") with `caps`.
  // Optionally clickable (`onclick`) and removable (`onremove`). Rendered once per row.
  import type { Snippet } from "svelte";
  import XIcon from "phosphor-svelte/lib/XIcon";

  interface Props {
    label?: string;
    children?: Snippet;
    /** Any CSS colour; unset, the tag is neutral. */
    color?: string;
    caps?: boolean;
    title?: string;
    onclick?: (e: MouseEvent) => void;
    /** With `onclick`, a toggle's state, as `aria-pressed`: a filter that is on. */
    pressed?: boolean;
    onremove?: () => void;
    removeLabel?: string;
  }

  const {
    label,
    children,
    color,
    caps = false,
    title,
    onclick,
    pressed,
    onremove,
    removeLabel = "Remove",
  }: Props = $props();
</script>

<span
  class={["tag", caps && "tag--caps", onremove && "removable", onclick && pressed && "is-on"]}
  style:--tag={color}
  {title}
>
  {#if onclick}
    <button type="button" class="name truncate" aria-pressed={pressed} {onclick}>
      {#if children}{@render children()}{:else}{label}{/if}
    </button>
  {:else}
    <span class="truncate"
      >{#if children}{@render children()}{:else}{label}{/if}</span
    >
  {/if}
  {#if onremove}
    <button type="button" class="remove" aria-label={removeLabel} onclick={onremove}>
      <XIcon weight="bold" />
    </button>
  {/if}
</span>

<style>
  .removable {
    padding-right: var(--gap-1);
  }
  .name {
    font: inherit;
  }
  .remove {
    display: grid;
    place-items: center;
    width: 1.3em;
    height: 1.3em;
    margin-left: var(--gap-1);
    border-radius: var(--radius-pill);
    opacity: 0.7;
  }
  @media (hover: hover) {
    .name:hover {
      text-decoration: underline;
    }
    .remove:hover {
      opacity: 1;
      background: color-mix(in oklab, currentColor 18%, transparent);
    }
  }
</style>
