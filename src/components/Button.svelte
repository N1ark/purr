<script lang="ts">
  // A button that reads as one; a thin wrapper over `.btn` (a link styled as one is `<a class="btn">`).
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Spinner from "./Spinner.svelte";

  interface Props extends Omit<HTMLButtonAttributes, "children"> {
    variant?: "default" | "primary" | "ghost" | "danger" | "link";
    size?: "sm" | "md" | "lg";
    /** Shows a spinner before the content and blocks clicks. */
    loading?: boolean;
    /** Announced while `loading`. */
    loadingLabel?: string;
    /** A toggle's state: sets `aria-pressed` and the engaged look. */
    pressed?: boolean;
    children: Snippet;
  }

  let {
    variant = "default",
    size = "md",
    loading = false,
    loadingLabel = "Loading",
    pressed,
    disabled = false,
    type = "button",
    class: extra,
    children,
    ...rest
  }: Props = $props();
</script>

<button
  {type}
  class={[
    "btn",
    variant !== "default" && `btn--${variant}`,
    size !== "md" && `btn--${size}`,
    loading && "is-loading",
    extra,
  ]}
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  aria-pressed={pressed}
  {...rest}
>
  {#if loading}<Spinner label={loadingLabel} />{/if}
  {@render children()}
</button>

<style>
  /* Loading keeps its colours: dimmed would read as refused. */
  .is-loading:disabled {
    opacity: 1;
    cursor: progress;
  }
</style>
