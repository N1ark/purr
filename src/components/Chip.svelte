<script lang="ts">
  // A capsule toggle ("Unread", "Archived", a gallery filter); styled by `.pill`.
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLButtonAttributes, "children"> {
    on?: boolean;
    label?: string;
    /** Content in place of `label`, e.g. an icon and a count. */
    children?: Snippet;
  }

  let { on = false, label, children, type = "button", class: extra, ...rest }: Props = $props();
</script>

<button {type} class={["pill", on && "is-on", extra]} aria-pressed={on} {...rest}>
  {#if children}{@render children()}{:else}{label}{/if}
</button>
