<script lang="ts">
  import {
    Button,
    Kbd,
    ShortcutList,
    ShortcutsOverlay,
    createKeymap,
    helpGroups,
    resolveKey,
    toast,
    type Binding,
  } from "purr";
  import { Keyboard } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  type Action = "down" | "up" | "inbox" | "later" | "delete" | "export" | "help";

  const BINDINGS: Binding<Action>[] = [
    { keys: "j", action: "down", label: "Next item", group: "Moving" },
    { keys: "↓", action: "down", label: "Next item", group: "Moving" },
    { keys: "k", action: "up", label: "Previous item", group: "Moving" },
    { keys: "↑", action: "up", label: "Previous item", group: "Moving", hidden: true },
    { keys: "g i", action: "inbox", label: "Go to the inbox", group: "Going" },
    { keys: "g l", action: "later", label: "Go to later", group: "Going" },
    { keys: "⇧D", action: "delete", label: "Delete the item", group: "Editing" },
    { keys: "⌘E", action: "export", label: "Export", group: "Editing" },
    { keys: "h", action: "help", label: "Show this list", group: "Going" },
  ];

  const keymap = createKeymap(BINDINGS);
  const groups = keymap.help({
    groups: ["Moving", "Going", "Editing"],
    extra: [{ label: "Close what's open", hints: ["Esc"], group: "Going" }],
  });

  const ITEMS = [
    "Design the schema",
    "Fix the tooltip",
    "Reply to Ada",
    "Ship 0.2",
    "Water the plants",
  ];
  let cursor = $state(0);
  let items = $state([...ITEMS]);
  let help = $state(false);
  let log = $state<{ id: number; key: string; result: string }[]>([]);
  let seq = 0;
  let chord: string | null = null;

  function run(action: Action) {
    if (action === "down") cursor = Math.min(items.length - 1, cursor + 1);
    else if (action === "up") cursor = Math.max(0, cursor - 1);
    else if (action === "inbox") toast("Inbox");
    else if (action === "later") toast("Later");
    else if (action === "delete" && items.length) {
      toast(`Deleted “${items[cursor]}”`);
      items = items.filter((_, i) => i !== cursor);
      cursor = Math.min(cursor, items.length - 1);
    } else if (action === "export") toast("Exported");
    else if (action === "help") help = true;
  }

  function onKeydown(e: KeyboardEvent) {
    // The pure resolver, for the log; `keymap.handle` does the same and runs it.
    const r = resolveKey(BINDINGS, e, { chord, typing: false, overlay: false });
    const result =
      r.kind === "action"
        ? `action ${r.action}`
        : r.kind === "chord"
          ? `chord ${r.prefix}…`
          : "none";
    if (!["Shift", "Meta", "Control", "Alt"].includes(e.key))
      log = [{ id: ++seq, key: e.key, result }, ...log].slice(0, 8);
    chord = r.kind === "chord" ? r.prefix : null;
    keymap.handle(e, run);
    // The site's own keys (t, /, ?) stay out of the demo.
    if (e.key !== "Tab") e.stopPropagation();
  }

  const TABLE = BINDINGS.filter((b) => !b.hidden);
</script>

<PageHeader
  title="createKeymap"
  description="One table of bindings drives the keys, the chords and the `?` overlay. `keymap.handle(event, run)` resolves a keydown (plain keys stand aside while typing or under an overlay; `⌘` ones do not), waits for a chord's second key, and prevents the default of what it handled."
  importLine={`import { createKeymap, helpGroups, ShortcutList, ShortcutsOverlay } from "purr";`}
  source="src/lib/keys.ts"
/>

<Section
  title="Try it"
  description="Click the list, then press j / k (or the arrows), g then i, g then l, ⇧D, ⌘E or h. The log shows what `resolveKey` made of each press."
  code={`type Action = "down" | "up" | "inbox" | "delete" | "help";
const keymap = createKeymap<Action>([
  { keys: "j", action: "down", label: "Next item", group: "Moving" },
  { keys: "↓", action: "down", label: "Next item", group: "Moving" },
  { keys: "g i", action: "inbox", label: "Go to the inbox", group: "Going" },
  { keys: "⇧D", action: "delete", label: "Delete the item", group: "Editing" },
  { keys: "h", action: "help", label: "Show this list", group: "Going" },
]);

// <svelte:window onkeydown={(e) => keymap.handle(e, run)} />`}
>
  <div class="s-row top fill">
    <div
      class="list surface"
      role="listbox"
      tabindex="0"
      aria-label="Items: use the keyboard"
      aria-activedescendant="km-{cursor}"
      onkeydown={onKeydown}
      onpointerdown={() => keymap.clearChord()}
    >
      {#each items as item, i (item)}
        <div
          id="km-{i}"
          class="row-item"
          class:is-cursor={i === cursor}
          role="option"
          aria-selected={i === cursor}
        >
          {item}
        </div>
      {:else}
        <p class="muted none">Nothing left.</p>
      {/each}
    </div>
    <div class="s-stack log">
      <span class="s-label">resolveKey</span>
      {#each log as entry (entry.id)}
        <span class="s-out"
          ><span class="muted">{JSON.stringify(entry.key)} →</span> {entry.result}</span
        >
      {:else}
        <span class="muted">No keys yet.</span>
      {/each}
    </div>
  </div>
</Section>

<Section
  title="The bindings"
  description="`keys` is a hint; `group` heads it in the help; `hidden` keeps an alias out of it. `typing` and `overlay` let a plain key fire while a field has focus or a dialog is open."
  block
>
  <table class="s-table">
    <thead><tr><th>keys</th><th>action</th><th>label</th><th>group</th></tr></thead>
    <tbody>
      {#each BINDINGS as b (b.keys)}
        <tr class:faint={b.hidden}>
          <td><Kbd hint={b.keys} /></td>
          <td class="mono">{b.action}</td>
          <td>{b.label}{b.hidden ? " (hidden)" : ""}</td>
          <td class="muted">{b.group}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="muted note">
    {TABLE.length} visible bindings fold into {groups.reduce((n, g) => n + g.entries.length, 0)} help
    rows: bindings sharing an action and a label are one row.
  </p>
</Section>

<Section
  title="The help"
  description="`keymap.help()` (or `helpGroups(bindings)`) folds the table into groups for `ShortcutList`, which `ShortcutsOverlay` puts in a modal. `extra` adds rows for keys handled elsewhere."
  code={`const groups = keymap.help({
  groups: ["Moving", "Going", "Editing"],
  extra: [{ label: "Close what's open", hints: ["Esc"], group: "Going" }],
});

<ShortcutList {groups} />
{#if help}<ShortcutsOverlay {groups} onclose={() => (help = false)} />{/if}`}
  block
>
  <div class="s-stack">
    <ShortcutList {groups} />
    <div>
      <Button onclick={() => (help = true)}><Keyboard /> Open the overlay</Button>
    </div>
    <span class="muted"
      >Same rows from <code>helpGroups</code>: {helpGroups(BINDINGS)
        .map((g) => g.title)
        .join(", ")}</span
    >
  </div>
</Section>

{#if help}
  <ShortcutsOverlay {groups} onclose={() => (help = false)} />
{/if}

<style>
  .fill {
    width: 100%;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    width: 280px;
    max-width: 100%;
    padding: var(--sp-2);
    box-shadow: none;
  }
  .none {
    margin: 0;
    padding: var(--sp-3);
  }
  .log {
    gap: var(--gap-2);
    min-width: 200px;
  }
  .note {
    margin: var(--sp-4) 0 0;
    font-size: var(--fs-sm);
  }
  code {
    font-family: var(--mono);
  }
</style>
