<script lang="ts">
  import { Tag, dragList, dropIndex, moveItem, toast } from "purr";
  import { DotsSixVertical, Folder, Hash } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let order = $state(["Inbox", "Mentions", "Starred", "Drafts", "Channels", "People"]);
  let lastReorder = $state<string | null>(null);

  let notes = $state(["Groceries", "Design review", "Trip to Lyon", "Reading list", "Taxes"]);
  let folders = $state<Record<string, string[]>>({ Archive: [], Work: [] });
  let lastDrop = $state<string | null>(null);

  let handled = $state(["Backlog", "Doing", "Review", "Done"]);

  let from = $state(0);
  let over = $state(3);
  let after = $state(true);
  const landed = $derived(dropIndex(from, over, after));
</script>

<PageHeader
  title="dragList"
  description="Rows marked `data-dnd-index` become draggable; `onreorder(from, to)` gets indices ready for `moveItem`."
  importLine={`import { dragList, dropIndex, moveItem } from "purr";`}
  source="src/actions/dragList.ts"
/>

<Section
  title="Reorder"
  description="A row only lands in a list of its own `group`."
  code={`<div
  use:dragList={{
    group: "sections",
    onreorder: (from, to) => (order = moveItem(order, from, to)),
  }}
>
  {#each order as name, i (name)}
    <div class="row-item" data-dnd-index={i}>{name}</div>
  {/each}
</div>`}
>
  <div class="s-row top fill">
    <div
      class="list surface"
      use:dragList={{
        group: "sections",
        onreorder: (a, b) => {
          lastReorder = `onreorder(${a}, ${b})`;
          order = moveItem(order, a, b);
        },
      }}
    >
      {#each order as name, i (name)}
        <div class="row-item" data-dnd-index={i}><Hash /> {name}</div>
      {/each}
    </div>
    <div class="s-stack">
      <span class="s-label">Last call</span>
      <span class="s-out">{lastReorder ?? "—"}</span>
      <span class="s-out muted">[{order.join(", ")}]</span>
    </div>
  </div>
</Section>

<Section
  title="Drop onto a target"
  description="A `data-dnd-target` element takes the drop instead: `ondropon(from, target)`."
  code={`<div use:dragList={{ group: "notes", ondropon: (from, folder) => file(from, folder) }}>
  <div class="row-item" data-dnd-target="Archive"><Folder /> Archive</div>
  {#each notes as note, i (note)}
    <div class="row-item" data-dnd-index={i}>{note}</div>
  {/each}
</div>`}
>
  <div class="s-row top fill">
    <div
      class="list surface"
      use:dragList={{
        group: "notes",
        onreorder: (a, b) => (notes = moveItem(notes, a, b)),
        ondropon: (index, target) => {
          const note = notes[index];
          lastDrop = `ondropon(${index}, "${target}")`;
          folders[target] = [...(folders[target] ?? []), note];
          notes = notes.filter((_, i) => i !== index);
          toast(`Moved “${note}” to ${target}`);
        },
      }}
    >
      {#each Object.entries(folders) as [name, inside] (name)}
        <div class="row-item folder" data-dnd-target={name}>
          <Folder weight="fill" />
          <span class="fills">{name}</span>
          {#if inside.length}<Tag label={String(inside.length)} />{/if}
        </div>
      {/each}
      {#each notes as note, i (note)}
        <div class="row-item" data-dnd-index={i}>{note}</div>
      {:else}
        <p class="muted empty">All filed.</p>
      {/each}
    </div>
    <div class="s-stack">
      <span class="s-label">Last call</span>
      <span class="s-out">{lastDrop ?? "—"}</span>
      {#each Object.entries(folders) as [name, inside] (name)}
        <span class="s-out muted">{name}: [{inside.join(", ")}]</span>
      {/each}
    </div>
  </div>
</Section>

<Section
  title="With a handle"
  description="`handle: true` drags only from a `data-dnd-handle`, so row text stays selectable."
  code={`<div use:dragList={{ group: "stages", handle: true, onreorder }}>
  {#each stages as stage, i (stage)}
    <div class="row-item" data-dnd-index={i}>
      <span data-dnd-handle><DotsSixVertical /></span> {stage}
    </div>
  {/each}
</div>`}
>
  <div
    class="list surface"
    use:dragList={{
      group: "stages",
      handle: true,
      onreorder: (a, b) => (handled = moveItem(handled, a, b)),
    }}
  >
    {#each handled as stage, i (stage)}
      <div class="row-item" data-dnd-index={i}>
        <span class="grip" data-dnd-handle><DotsSixVertical weight="bold" /></span>
        <span class="selectable">{stage}</span>
      </div>
    {/each}
  </div>
</Section>

<Section
  title="dropIndex"
  description="The arithmetic behind `to`: a destination after the source shifts down one."
  code={`dropIndex(${from}, ${over}, ${after}) // ${landed}`}
>
  <div class="s-row">
    <label class="s-row field"
      >from <input class="field-input num" type="number" min="0" max="5" bind:value={from} /></label
    >
    <label class="s-row field"
      >over <input class="field-input num" type="number" min="0" max="5" bind:value={over} /></label
    >
    <label class="s-row field"
      ><input type="checkbox" class="checkbox" bind:checked={after} /> after</label
    >
    <span class="s-out">→ {landed}</span>
  </div>
</Section>

<style>
  .fill {
    width: 100%;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    width: 260px;
    max-width: 100%;
    padding: var(--sp-2);
    box-shadow: none;
  }
  .folder {
    color: var(--theme2);
  }
  .empty {
    margin: 0;
    padding: var(--sp-2) var(--sp-3);
    font-size: var(--fs-sm);
  }
  .grip {
    display: inline-flex;
    color: var(--faint);
  }
  .field {
    gap: var(--gap-3);
    font-size: var(--fs-sm);
  }
  .num {
    width: 64px;
  }
</style>
