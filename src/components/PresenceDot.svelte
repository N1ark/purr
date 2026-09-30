<script lang="ts" module>
  export type { Presence } from "./types";
</script>

<script lang="ts">
  // Presence: green when active, amber when idle, nothing when offline. Set `--ring-bg` on the
  // surface behind it so the cut-out ring matches. Rendered once per row: keep it bare.
  import type { Presence } from "./types";

  interface Props {
    state: Presence;
    /** Diameter in pixels. */
    size?: number;
    ring?: boolean;
    /** Accessible name ("Active"); without one the dot is decoration. */
    label?: string;
  }

  const { state, size = 7, ring = true, label }: Props = $props();
</script>

{#if state !== "offline"}
  <span
    class="dot {state}"
    class:ring
    style:width="{size}px"
    style:height="{size}px"
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  ></span>
{/if}

<style>
  .dot {
    display: inline-block;
    flex: none;
    border-radius: 50%;
  }
  .ring {
    box-shadow: 0 0 0 1.5px var(--ring-bg, var(--bg2));
  }
  .active {
    background: var(--success);
  }
  .idle {
    background: var(--warn);
  }
</style>
