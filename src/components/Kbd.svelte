<script lang="ts">
  // A shortcut hint, written the platform's way: `⇧⌘K` on a Mac, `Ctrl+Shift+K` elsewhere.
  // A chord's steps are separate keys. Hidden on a phone, where there is no keyboard to press.
  import { shortcutParts } from "../lib/keys";

  interface Props {
    /** A hint in the canonical glyph form (`lib/keys.ts`): `"⇧⌘K"`, `"j"`, `"g i"`. */
    hint: string;
    /** Between a chord's steps. */
    then?: string;
  }

  const { hint, then = "then" }: Props = $props();

  const parts = $derived(shortcutParts(hint));
</script>

<span class="kbd">
  {#each parts as part, i (i)}
    {#if i > 0}<span class="then">{then}</span>{/if}
    <kbd>{part}</kbd>
  {/each}
</span>

<style>
  .kbd {
    display: inline-flex;
    align-items: baseline;
    gap: var(--gap-2);
    flex: none;
    white-space: nowrap;
  }
  .then {
    font-size: var(--fs-micro);
    color: var(--faint);
  }
  :global(body.mobile) .kbd {
    display: none;
  }
</style>
