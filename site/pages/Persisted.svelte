<script lang="ts">
  import {
    Button,
    Switch,
    memoryStorage,
    persisted,
    persistedFlag,
    readFlag,
    readJson,
    readString,
    toast,
    writeJson,
    writeString,
  } from "purr";
  import { Minus, Plus } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const KEYS = {
    count: "purr.site.demo.count",
    note: "purr.site.demo.note",
    open: "purr.site.demo.open",
    raw: "purr.site.demo.raw",
  };

  const count = persisted(KEYS.count, 0);
  const note = persisted(KEYS.note, { text: "Remember me", tags: ["demo"] });
  const open = persistedFlag(KEYS.open, true);

  // What is actually stored, re-read after each change.
  let stored = $state<Record<string, string | null>>({});
  function refresh() {
    stored = Object.fromEntries(Object.values(KEYS).map((k) => [k, readString(k)]));
  }
  $effect(() => {
    void [count.value, note.value, open.value];
    refresh();
  });

  let raw = $state(readString(KEYS.raw) ?? "");

  function reset() {
    count.value = 0;
    note.value = { text: "Remember me", tags: ["demo"] };
    open.value = true;
    raw = "";
    // The runes wrote their initial values back; the demo leaves nothing behind.
    for (const key of Object.values(KEYS)) writeString(key, null);
    refresh();
    toast("Cleared the demo keys");
  }

  const asJson = $derived.by(() => {
    void raw;
    return JSON.stringify(readJson(KEYS.raw, [], Array.isArray));
  });
  const flag = $derived.by(() => {
    void open.value;
    return readFlag(KEYS.open, false);
  });

  const memory = memoryStorage();
  memory.setItem("greeting", "hello");
</script>

<PageHeader
  title="persisted"
  description="A rune that survives a reload: it reads storage once and writes on every assignment to `.value`. The helpers never throw; failures read back the fallback."
  importLine={`import { persisted, persistedFlag, readJson, writeJson } from "purr";`}
  source="src/lib/persisted.svelte.ts"
/>

<Section
  title="persisted"
  description="Change these, then reload. Only assigning `.value` writes, so replace nested objects."
  code={`const count = persisted("app:count", 0);
const note = persisted("app:note", { text: "Remember me", tags: ["demo"] });

count.value++;
note.value = { ...note.value, text };`}
>
  <div class="s-row">
    <Button size="sm" onclick={() => count.value--} aria-label="Less"><Minus /></Button>
    <span class="s-out count">{count.value}</span>
    <Button size="sm" onclick={() => count.value++} aria-label="More"><Plus /></Button>
  </div>
  <input
    class="field-input short"
    aria-label="Note"
    value={note.value.text}
    oninput={(e) => (note.value = { ...note.value, text: e.currentTarget.value })}
  />
</Section>

<Section
  title="persistedFlag"
  description="A toggle stored as `1` or `0`."
  code={`const minimap = persistedFlag("app:minimap", true);
<Switch label="Minimap" bind:checked={minimap.value} />`}
>
  <Switch label="Panel open" bind:checked={open.value} />
  <span class="muted">Panel {open.value ? "open" : "closed"}</span>
</Section>

<Section title="What is stored" description="The raw values, through `readString`." block>
  <div class="s-stack">
    <table class="s-table">
      <tbody>
        {#each Object.entries(stored) as [key, value] (key)}
          <tr>
            <td class="mono">{key}</td>
            <td class="mono muted">{value ?? "null"}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div><Button variant="danger" size="sm" onclick={reset}>Reset the demo keys</Button></div>
  </div>
</Section>

<Section
  title="The storage helpers"
  description="`readJson` takes a fallback and an optional guard against a stale shape; `memoryStorage` stands in for `localStorage`."
  code={`writeString(key, "text");        // null removes it
readJson(key, [], Array.isArray); // fallback when missing, unreadable or the wrong shape
writeJson(key, { a: 1 });
readFlag(key, false);
const store = memoryStorage();`}
  block
>
  <div class="s-stack">
    <div class="s-row">
      <input
        class="field-input short"
        aria-label="Raw string"
        placeholder="writeString…"
        bind:value={raw}
        oninput={() => {
          writeString(KEYS.raw, raw || null);
          refresh();
        }}
      />
      <Button
        size="sm"
        onclick={() => {
          writeJson(KEYS.raw, [1, 2, 3]);
          raw = readString(KEYS.raw) ?? "";
          refresh();
        }}>writeJson([1, 2, 3])</Button
      >
    </div>
    <span class="s-out">readJson(raw, [], Array.isArray) = {asJson}</span>
    <span class="s-out">readFlag(open, false) = {flag}</span>
    <span class="s-out"
      >memoryStorage().getItem("greeting") = {JSON.stringify(memory.getItem("greeting"))}</span
    >
  </div>
</Section>

<style>
  .count {
    min-width: 3ch;
    text-align: center;
    font-size: var(--fs-lg);
  }
  .short {
    width: 220px;
    max-width: 100%;
  }
</style>
