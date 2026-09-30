<script lang="ts">
  // A destructive action that takes two presses: the first arms it and says what the second
  // will do; it disarms by itself after `timeout`, or when focus leaves.
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLButtonAttributes, "children" | "onclick"> {
    /** What the armed button says ("Click to confirm"). */
    confirmLabel: string;
    onconfirm: () => void;
    /** `link` for an inline action in running text ("Undo (keep changes)"). */
    variant?: "default" | "ghost" | "danger" | "link";
    size?: "sm" | "md" | "lg";
    /** Milliseconds before an armed button disarms. */
    timeout?: number;
    /** Armed, waiting for the second press; bind it to arm from a shortcut too. */
    armed?: boolean;
    /** The idle content. */
    children: Snippet;
  }

  let {
    confirmLabel,
    onconfirm,
    variant = "danger",
    size = "md",
    timeout = 4000,
    armed = $bindable(false),
    type = "button",
    class: extra,
    children,
    ...rest
  }: Props = $props();

  function disarm() {
    armed = false;
  }

  function click() {
    if (!armed) {
      armed = true;
      return;
    }
    disarm();
    onconfirm();
  }

  // However it was armed, it disarms by itself.
  $effect(() => {
    if (!armed) return;
    const timer = setTimeout(disarm, timeout);
    return () => clearTimeout(timer);
  });
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
  /* A link arms by turning red, not by growing a fill around the words. */
  .btn--link.is-armed,
  .btn--link.is-armed:hover:not(:disabled) {
    background: none;
    color: var(--danger);
  }
</style>
