<script lang="ts">
  // The keymap as a list, grouped: what the `?` overlay shows, and a settings tab can embed.
  import type { HelpGroup } from "../lib/keys";
  import Kbd from "./Kbd.svelte";

  interface Props {
    /** From `keymap.help()` or `helpGroups(bindings)`. */
    groups: readonly HelpGroup[];
    /** Between two keys that do the same thing. */
    or?: string;
    then?: string;
  }

  const { groups, or = "or", then }: Props = $props();
</script>

<div class="shortcuts">
  {#each groups as group (group.title)}
    <section>
      <h3>{group.title}</h3>
      <dl>
        {#each group.entries as entry (entry.label)}
          <div class="shortcut">
            <dt>
              {#each entry.hints as hint, i (hint)}
                {#if i > 0}<span class="or">{or}</span>{/if}
                <Kbd {hint} {then} />
              {/each}
            </dt>
            <dd>{entry.label}</dd>
          </div>
        {/each}
      </dl>
    </section>
  {/each}
</div>

<style>
  .shortcuts {
    display: flex;
    flex-direction: column;
    gap: var(--sp-5);
  }
  h3 {
    margin: 0 0 var(--sp-2);
    font-size: var(--fs-xs);
    font-weight: 600;
    color: var(--muted);
  }
  dl {
    margin: 0;
  }
  .shortcut {
    display: grid;
    grid-template-columns: minmax(120px, 38%) 1fr;
    align-items: baseline;
    gap: var(--sp-4);
    padding: var(--sp-1) 0;
  }
  dt {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: baseline;
    gap: var(--gap-2);
  }
  .or {
    font-size: var(--fs-micro);
    color: var(--faint);
  }
  dd {
    margin: 0;
    font-size: var(--fs-sm);
    color: var(--color);
  }
</style>
