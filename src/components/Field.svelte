<script lang="ts">
  // A labelled control: the label, the control (`children`), then a hint or an error under it.
  // `inline` puts a checkbox or switch beside its label instead.
  import type { Snippet } from "svelte";

  interface Props {
    label?: string;
    hint?: string;
    /** Replaces the hint, in the danger colour; the control should also set `aria-invalid`. */
    error?: string;
    inline?: boolean;
    /** Ids for the control's `aria-describedby`, which the hint and error carry. */
    id?: string;
    children: Snippet;
  }

  const uid = $props.id();
  const { label, hint, error, inline = false, id = uid, children }: Props = $props();
</script>

<label class="field" class:inline>
  {#if label}<span class="label">{label}</span>{/if}
  {@render children()}
  {#if error}
    <span class="note error" id="{id}-note" role="alert">{error}</span>
  {:else if hint}
    <span class="note" id="{id}-note">{hint}</span>
  {/if}
</label>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    min-width: 0;
  }
  .field.inline {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-3);
  }
  .label {
    font-size: var(--fs-xs);
    font-weight: 600;
    color: var(--muted);
  }
  .inline .label {
    order: 1;
    font-size: var(--fs-sm);
    font-weight: 400;
    color: var(--color);
  }
  .inline .note {
    order: 2;
    flex-basis: 100%;
  }
  .note {
    font-size: var(--fs-xs);
    line-height: 1.4;
    color: var(--muted);
  }
  .error {
    color: var(--danger);
  }
</style>
