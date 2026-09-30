<script lang="ts">
  // A titled run of `SettingRow`s, with an optional note under them.
  import type { Snippet } from "svelte";

  interface Props {
    title?: string;
    /** Under the title, before the rows. */
    description?: string;
    /** Under the rows. */
    note?: string;
    children: Snippet;
  }

  const { title, description, note, children }: Props = $props();
</script>

<section class="group">
  {#if title}<h4 class="title">{title}</h4>{/if}
  {#if description}<p class="description">{description}</p>{/if}
  <div class="rows">{@render children()}</div>
  {#if note}<p class="note">{note}</p>{/if}
</section>

<style>
  .group + :global(.group) {
    margin-top: var(--sp-5);
  }
  .title {
    margin: 0 0 var(--gap-1);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .description,
  .note {
    margin: 0 0 var(--sp-2);
    font-size: var(--fs-xs);
    line-height: 1.5;
    color: var(--muted);
  }
  .note {
    margin: var(--sp-2) 0 0;
  }
</style>
