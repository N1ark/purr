<script lang="ts">
  import {
    Button,
    clamp,
    copyText,
    errorMessage,
    lockScroll,
    lruCache,
    moveItem,
    slugify,
    toast,
    topK,
  } from "purr";
  import { Copy } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let toCopy = $state("Hello, clipboard");

  let heading = $state("Où est passé l'été ?");

  let release: (() => void) | null = $state(null);
  function toggleLock() {
    if (release) {
      release();
      release = null;
    } else release = lockScroll();
  }
  $effect(() => () => release?.());
  async function copy() {
    const ok = await copyText(toCopy);
    if (ok) toast.success("Copied");
    else toast.error("Couldn't reach the clipboard");
  }

  let list = $state(["a", "b", "c", "d", "e"]);
  let from = $state(0);
  let to = $state(3);

  let value = $state(140);
  let min = $state(0);
  let max = $state(100);

  const NUMBERS = [42, 7, 93, 18, 64, 3, 77, 51, 29, 88, 12, 60];
  let k = $state(4);

  let budget = $state(3);
  let cache = lruCache<string, number>(3);
  let keys = $state<string[]>([]);
  let cacheLog = $state<string[]>([]);
  let nextKey = $state("a");

  function resetCache() {
    cache = lruCache(budget);
    keys = [];
    cacheLog = [];
  }

  function setKey() {
    const key = nextKey.trim();
    if (!key) return;
    cache.set(key, key.length);
    const before = keys;
    keys = [...before.filter((x) => x !== key), key].filter((x) => cache.has(x));
    const evicted = before.filter((x) => !cache.has(x));
    cacheLog = [
      `set("${key}")${evicted.length ? ` evicted ${evicted.map((e) => `"${e}"`).join(", ")}` : ""}`,
      ...cacheLog,
    ].slice(0, 6);
    nextKey = String.fromCharCode(key.charCodeAt(0) + 1);
  }

  function getKey(key: string) {
    const hit = cache.get(key);
    keys = [...keys.filter((x) => x !== key), key].filter((x) => cache.has(x));
    cacheLog = [`get("${key}") → ${hit}`, ...cacheLog].slice(0, 6);
  }

  const THROWN: [string, unknown][] = [
    ['new Error("Not found")', new Error("Not found")],
    ['"a string from Tauri"', "a string from Tauri"],
    ['{ message: "an object" }', { message: "an object" }],
    ["404", 404],
    ["null", null],
  ];
</script>

<PageHeader
  title="Clipboard & lists"
  description="Small helpers that belong to no module in particular."
  importLine={`import { copyText, moveItem, clamp, topK, lruCache, errorMessage } from "purr";`}
  source="src/lib/util.ts"
/>

<Section
  title="copyText"
  description="Resolves `false` rather than rejecting."
  code={`if (await copyText(path)) toast("Copied");`}
>
  <input class="field-input wide" aria-label="Text to copy" bind:value={toCopy} />
  <Button onclick={copy}><Copy /> Copy</Button>
</Section>

<Section
  title="moveItem"
  description="A copy with `from` moved to `to` (an index in the list without it), as `dragList`'s `onreorder` reports."
  code={`moveItem(${JSON.stringify(list)}, ${from}, ${to}) // ${JSON.stringify(moveItem(list, from, to))}`}
>
  <label class="s-row field"
    >from <input class="field-input num" type="number" min="0" max="4" bind:value={from} /></label
  >
  <label class="s-row field"
    >to <input class="field-input num" type="number" min="0" max="4" bind:value={to} /></label
  >
  <span class="s-out">[{moveItem(list, from, to).join(", ")}]</span>
  <Button size="sm" onclick={() => (list = moveItem(list, from, to))}>Apply</Button>
</Section>

<Section title="clamp" code={`clamp(${value}, ${min}, ${max}) // ${clamp(value, min, max)}`}>
  <label class="s-row field">value <input class="field-input num" type="number" bind:value /></label
  >
  <label class="s-row field"
    >min <input class="field-input num" type="number" bind:value={min} /></label
  >
  <label class="s-row field"
    >max <input class="field-input num" type="number" bind:value={max} /></label
  >
  <span class="s-out">→ {clamp(value, min, max)}</span>
</Section>

<Section
  title="topK"
  description="The best `limit` items in order, in one pass, without sorting the rest."
  code={`topK(numbers, ${k}, (a, b) => b - a) // ${JSON.stringify(topK(NUMBERS, k, (a, b) => b - a))}`}
>
  <span class="s-out muted">[{NUMBERS.join(", ")}]</span>
  <label class="s-row field"
    >k <input class="field-input num" type="number" min="0" max="12" bind:value={k} /></label
  >
  <span class="s-out">→ [{topK(NUMBERS, k, (a, b) => b - a).join(", ")}]</span>
</Section>

<Section
  title="lruCache"
  description="A weighted budget (1 per entry by default); reading an entry refreshes it."
  code={`const cache = lruCache<string, Image>(${budget});
cache.set(key, image, weight);
cache.get(key); // refreshes it`}
  block
>
  <div class="s-stack">
    <div class="s-row">
      <label class="s-row field"
        >budget <input
          class="field-input num"
          type="number"
          min="1"
          max="8"
          bind:value={budget}
          onchange={resetCache}
        /></label
      >
      <input class="field-input num" aria-label="Key" bind:value={nextKey} />
      <Button size="sm" onclick={setKey}>set</Button>
      <Button size="sm" variant="ghost" onclick={resetCache}>clear</Button>
    </div>
    <div class="s-row">
      <span class="s-label">oldest → newest</span>
      {#each keys as key (key)}
        <button type="button" class="pill" onclick={() => getKey(key)}>get {key}</button>
      {:else}
        <span class="muted">empty</span>
      {/each}
    </div>
    {#each cacheLog as line, i (i)}<span class="s-out">{line}</span>{/each}
  </div>
</Section>

<Section
  title="errorMessage"
  description="A message from whatever was thrown: an `Error`, a string, an object."
  code={`try { await save(); } catch (e) { toast.error(errorMessage(e)); }`}
  block
>
  <table class="s-table">
    <tbody>
      {#each THROWN as [label, thrown] (label)}
        <tr>
          <td class="mono">{label}</td>
          <td class="s-out">{JSON.stringify(errorMessage(thrown))}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Section>

<Section
  title="slugify"
  description="A heading's anchor, accents folded; `uniqueSlug` adds `-2`, `-3` past ids already used."
  code={`slugify(${JSON.stringify(heading)}) // ${JSON.stringify(slugify(heading))}`}
>
  <input class="field-input" aria-label="Heading" bind:value={heading} />
  <span class="s-out">#{slugify(heading)}</span>
</Section>

<Section
  title="lockScroll"
  description="Holds a scrolling page still under a modal (`Modal` does it itself); stacked locks release with the last."
  code={`$effect(() => lockScroll());`}
>
  <Button onclick={toggleLock}>{release ? "Release" : "Lock"} the page</Button>
  <span class="muted">{release ? "html is overflow: hidden" : "unlocked"}</span>
</Section>

<style>
  .field {
    gap: var(--gap-3);
    font-size: var(--fs-sm);
  }
  .num {
    width: 72px;
  }
  .wide {
    width: 300px;
    max-width: 100%;
  }
</style>
