<script lang="ts">
  // For a server-rendered page: `bootTheme` inline in the <head>, so the first paint is already
  // in the stored (or the system's) theme. Pair it with `applyTheme({ mode, storageKey })` on mount.
  import { themeScript } from "../lib/theme";

  interface Props {
    /** The key `applyTheme({ storageKey })` writes. */
    storageKey: string;
    /** For a Content-Security-Policy that allows inline scripts by nonce. */
    nonce?: string;
  }

  const { storageKey, nonce }: Props = $props();

  const tag = $derived(
    `<script${nonce ? ` nonce="${nonce.replace(/"/g, "&quot;")}"` : ""}>${themeScript(storageKey)}</` +
      "script>",
  );
</script>

<svelte:head>
  {@html tag}
</svelte:head>
