<script lang="ts">
  // A disclosure chevron: right when closed, down when open, everywhere.
  import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";

  interface Props {
    open: boolean;
    /** Pixels. */
    size?: number;
  }

  const { open, size = 12 }: Props = $props();
</script>

<!-- Sized from the icon, not by it: a box that grew as the chevron turned would nudge its neighbours. -->
<span class="twisty" class:open style:--twisty="{size}px" aria-hidden="true">
  <CaretRightIcon {size} weight="bold" />
</span>

<style>
  .twisty {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--twisty);
    height: var(--twisty);
    color: var(--muted);
    transition: transform var(--dur) var(--ease);
  }
  .open {
    transform: rotate(90deg);
  }
</style>
