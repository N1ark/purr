<script lang="ts">
  // Mount once in the app's root: renders whatever `menu.show(...)` opened.
  import { menu } from "../lib/menu.svelte";
  import Menu from "./Menu.svelte";

  interface Props {
    /** Announced when a menu has no title. */
    label?: string;
    dismissLabel?: string;
    customColorLabel?: string;
  }

  const { label, dismissLabel, customColorLabel }: Props = $props();
</script>

{#if menu.open}
  {#key menu.version}
    {@const version = menu.version}
    <Menu
      entries={menu.entries}
      anchor={menu.anchor}
      placement={menu.placement}
      title={menu.title}
      {label}
      {dismissLabel}
      {customColorLabel}
      onclose={() => menu.close(version)}
    />
  {/key}
{/if}
