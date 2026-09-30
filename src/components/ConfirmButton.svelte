<script lang="ts">
  // A destructive action that takes two presses: the first arms it and says what the second
  // will do; it disarms by itself after `timeout`, or when focus leaves.
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLButtonAttributes, "children" | "onclick"> {
    /** What the armed button says ("Click to confirm"). */
    confirmLabel: string;
    onconfirm: () => void;
    variant?: "default" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    /** Milliseconds before an armed button disarms. */
    timeout?: number;
    /** The idle content. */
    children: Snippet;
  }

  let {
    confirmLabel,
    onconfirm,
    variant = "danger",
    size = "md",
    timeout = 4000,
    type = "button",
    class: extra,
    children,
    ...rest
  }: Props = $props();

  let armed = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function disarm() {
    clearTimeout(timer);
    armed = false;
  }

  function click() {
    if (!armed) {
      armed = true;
      timer = setTimeout(disarm, timeout);
      return;
    }
    disarm();
    onconfirm();
  }

  $effect(() => disarm);
</script>

<button
  {type}
  class={[
    "btn",
    variant !== "default" && `btn--${variant}`,
    size !== "md" && `btn--${size}`,
    armed && "is-armed",
    extra,
  ]}
  onclick={click}
  onblur={disarm}
  {...rest}
>
  {#if armed}{confirmLabel}{:else}{@render children()}{/if}
</button>

<style>
  .btn.is-armed,
  .btn.is-armed:hover:not(:disabled) {
    background: var(--danger);
    border-color: var(--danger);
    color: var(--on-danger);
  }
</style>
