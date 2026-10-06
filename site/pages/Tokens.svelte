<script lang="ts">
  // Every custom property in `tokens.css`, parsed from the file itself, with its live value in
  // the theme, accent and density the site is painted in right now.
  import css from "purr/styles/tokens.css?raw";
  import { Badge, SearchInput, Tag, copyText, matchesAny, toast, tooltip } from "purr";
  import { Gear } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import { inlineCode } from "../lib/format";
  import { look, touch } from "../lib/site.svelte";
  import { categorise, parseTokens, type Kind, type Token } from "../lib/tokens";

  const TOKENS = parseTokens(css);
  const GROUPS = categorise(TOKENS);

  let query = $state("");
  let live = $state<Record<string, string>>({});
  let probe = $state<HTMLElement | null>(null);

  const shown = $derived(
    GROUPS.map((g) => ({
      ...g,
      tokens: g.tokens.filter((t) =>
        matchesAny(query, t.name, t.note, g.category.title, ...Object.values(t.values)),
      ),
    })).filter((g) => g.tokens.length),
  );
  const count = $derived(shown.reduce((n, g) => n + g.tokens.length, 0));

  // Read after the theme has been repainted: the App applies it in its own effect.
  $effect(() => {
    void [look.theme.value, look.accent.value, look.density.value, touch.on];
    const frame = requestAnimationFrame(() => {
      const root = getComputedStyle(document.body);
      const next: Record<string, string> = {};
      for (const group of GROUPS)
        for (const t of group.tokens) next[t.name] = resolve(t.name, group.category.kind, root);
      live = next;
    });
    return () => cancelAnimationFrame(frame);
  });

  /** What the property holds now; colours and lengths are resolved through a probe element. */
  function resolve(name: string, kind: Kind, root: CSSStyleDeclaration): string {
    const raw = root.getPropertyValue(name).trim();
    if (!probe) return raw;
    if (kind === "color" && !/^#[0-9a-f]+$/i.test(raw)) {
      probe.style.color = `var(${name})`;
      return getComputedStyle(probe).color;
    }
    if ((kind === "type" || kind === "size" || kind === "space") && raw.startsWith("calc")) {
      probe.style.width = `var(${name})`;
      return getComputedStyle(probe).width;
    }
    return raw;
  }

  async function copy(name: string) {
    if (await copyText(`var(${name})`)) toast(`Copied var(${name})`);
  }

  const OVERRIDES = ["cozy", "dense", "mobile"] as const;
  const zOrder = (tokens: Token[]) =>
    [...tokens].sort((a, b) => Number(a.values.light) - Number(b.values.light));
</script>

{#snippet name(t: Token)}
  <button type="button" class="name mono" onclick={() => copy(t.name)} use:tooltip={"Copy var()"}
    >{t.name}</button
  >
{/snippet}

{#snippet overrides(t: Token)}
  {#each OVERRIDES as scope (scope)}
    {#if t.values[scope]}
      <span use:tooltip={scope === "mobile" ? "body.mobile" : `html.density-${scope}`}>
        <Tag label="{scope} {t.values[scope]}" />
      </span>
    {/if}
  {/each}
{/snippet}

{#snippet note(t: Token)}
  {#if t.note}<div class="note muted">{@html inlineCode(t.note)}</div>{/if}
{/snippet}

<PageHeader
  title="Tokens"
  description="Every custom property in `tokens.css`, live in the current look. Click a name to copy its `var()`."
  importLine={`import "purr/styles.css";`}
  source="src/styles/tokens.css"
/>

<div class="filter">
  <SearchInput
    variant="field"
    label="Filter tokens"
    placeholder="Filter tokens…"
    bind:value={query}
    clearable
  />
  <span class="muted">{count} of {TOKENS.length}</span>
</div>

<div class="probe" bind:this={probe} aria-hidden="true"></div>

{#each shown as { category, tokens } (category.title)}
  <section>
    <h2>{category.title} <Badge count={tokens.length} tone="soft" /></h2>
    {#if category.kind === "color"}
      <div class="swatches">
        {#each tokens as t (t.name)}
          <div class="color">
            <div class="chip checker">
              <div class="fill" style:background="var({t.name})"></div>
            </div>
            <div class="color-text">
              {@render name(t)}
              <span class="mono value">{live[t.name] ?? ""}</span>
              <span class="mono faint value"
                >light {t.values.light}{#if t.values.dark}<br />dark {t.values.dark}{/if}</span
              >
              {@render note(t)}
            </div>
          </div>
        {/each}
      </div>
    {:else if category.kind === "shadow" || category.kind === "font"}
      <div class="cards">
        {#each tokens as t (t.name)}
          <div class="card">
            {#if category.kind === "font"}
              <span class="font" style:font-family="var({t.name})">Ag 0123 → fn() ≠ ==</span>
            {:else if t.name.startsWith("--scrim")}
              <div class="box checker">
                <div class="fill" style:background="var({t.name})"></div>
              </div>
            {:else}
              <div class="box raised" style:box-shadow="var({t.name})"></div>
            {/if}
            {@render name(t)}
            <span class="mono faint value"
              >{t.values.dark ? "light " : ""}{t.values.light}{#if t.values.dark}<br />dark {t
                  .values.dark}{/if}</span
            >
            {@render note(t)}
          </div>
        {/each}
      </div>
    {:else}
      <div class="table-wrap">
        <table class="s-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Now</th>
              <th class="sample-col">Sample</th>
            </tr>
          </thead>
          <tbody>
            {#each category.kind === "z" ? zOrder(tokens) : tokens as t (t.name)}
              <tr>
                <td>{@render name(t)}{@render note(t)}</td>
                <td>
                  <span class="mono">{t.values.light ?? "—"}</span>
                  {#if t.values.dark}<span class="mono faint">dark {t.values.dark}</span>{/if}
                  {@render overrides(t)}
                </td>
                <td class="mono muted now">
                  {live[t.name] && live[t.name] !== t.values.light ? live[t.name] : ""}
                </td>
                <td class="sample-col">
                  {#if category.kind === "radius"}
                    <div class="box rounded" style:border-radius="var({t.name})"></div>
                  {:else if category.kind === "space"}
                    <div class="bar" style:width="var({t.name})"></div>
                  {:else if category.kind === "type"}
                    {#if t.name === "--line-height"}
                      <p class="lines">Two lines of text<br />at this line height.</p>
                    {:else}
                      <span class="type" style:font-size="var({t.name})">The quick brown fox</span>
                    {/if}
                  {:else if category.kind === "size"}
                    {#if t.name.startsWith("--icon")}
                      <span class="icon" style:font-size="var({t.name})"><Gear /></span>
                    {:else}
                      <div
                        class="square"
                        style:width="var({t.name})"
                        style:height="var({t.name})"
                      ></div>
                    {/if}
                  {:else if category.kind === "motion"}
                    <span class="track">
                      <span
                        class="dot"
                        style:transition-duration={t.name.startsWith("--dur")
                          ? `var(${t.name})`
                          : t.name === "--ease-sheet"
                            ? "var(--dur-sheet)"
                            : "var(--dur-slow)"}
                        style:transition-timing-function={t.name.startsWith("--ease")
                          ? `var(${t.name})`
                          : "var(--ease)"}
                      ></span>
                    </span>
                  {:else if category.kind === "z"}
                    <span class="layer" style:--depth={Number(t.values.light) / 700}></span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if category.kind === "motion"}
        <p class="faint hint">Hover a row to play it.</p>
      {/if}
    {/if}
  </section>
{:else}
  <p class="muted">No token matches “{query.trim()}”.</p>
{/each}

<style>
  .filter {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    max-width: 420px;
    margin-bottom: calc(var(--sp-5) * 2);
    font-size: var(--fs-sm);
  }
  .filter :global(.search) {
    flex: 1;
  }
  .probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }
  section {
    margin-bottom: calc(var(--sp-5) * 2.5);
  }
  h2 {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-lg);
    font-weight: 600;
    color: var(--color2);
  }
  .name {
    padding: 0;
    color: var(--color2);
    font-size: var(--fs-sm);
    text-align: left;
    overflow-wrap: anywhere;
  }
  @media (hover: hover) {
    .name:hover {
      color: var(--theme2);
    }
  }
  .note :global(code) {
    font-family: var(--mono);
    font-size: 0.92em;
  }
  .note {
    max-width: 48ch;
    margin-top: var(--gap-1);
    font-size: var(--fs-xs);
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--sp-4);
  }
  .color {
    display: flex;
    gap: var(--sp-4);
    min-width: 0;
    padding: var(--sp-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  .color-text {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    min-width: 0;
  }
  .value {
    font-size: var(--fs-xs);
    overflow-wrap: anywhere;
  }
  /* A checkerboard, so a translucent token shows as translucent. */
  .checker {
    background: repeating-conic-gradient(var(--bg4) 0 25%, var(--bg) 0 50%) 0 0 / var(--sp-4)
      var(--sp-4);
  }
  .chip {
    flex: none;
    width: calc(var(--avatar) * 2);
    height: calc(var(--avatar) * 2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .fill {
    width: 100%;
    height: 100%;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--sp-4);
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    min-width: 0;
    padding: var(--sp-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  .card .box,
  .card .font {
    margin-bottom: var(--sp-3);
  }
  .table-wrap {
    overflow-x: auto;
  }
  /* Scrolls sideways on a phone rather than wrapping every name a letter at a time. */
  .table-wrap .s-table {
    min-width: 620px;
  }
  .table-wrap .name {
    white-space: nowrap;
  }
  td {
    vertical-align: middle;
  }
  td :global(.tag) {
    margin-left: var(--gap-2);
  }
  td .faint {
    margin-left: var(--gap-3);
  }
  .now {
    font-size: var(--fs-xs);
    white-space: nowrap;
  }
  .sample-col {
    width: 40%;
  }
  .box {
    width: calc(var(--sp-5) * 4);
    height: calc(var(--sp-5) * 2.5);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .raised {
    margin: var(--sp-3) 0;
    background: var(--surface);
  }
  .rounded {
    border: 1px solid var(--border-strong);
    background: var(--theme-soft);
  }
  .bar {
    height: var(--sp-4);
    border-radius: var(--radius-sm);
    background: var(--theme2);
  }
  .type {
    color: var(--color2);
    white-space: nowrap;
  }
  .lines {
    margin: 0;
    line-height: var(--line-height);
    font-size: var(--fs-sm);
  }
  .font {
    font-size: var(--fs-xl);
    color: var(--color2);
  }
  .square {
    border: 1px solid var(--theme2);
    border-radius: var(--radius-sm);
    background: var(--theme-soft);
  }
  .icon {
    display: inline-flex;
    color: var(--color2);
  }
  .track {
    position: relative;
    display: block;
    width: calc(var(--sp-5) * 10);
    max-width: 100%;
    height: var(--sp-4);
    border-radius: var(--radius-pill);
    background: var(--bg3);
  }
  .dot {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--sp-4);
    height: var(--sp-4);
    border-radius: 50%;
    background: var(--theme2);
    transition-property: transform;
  }
  tr:hover .dot {
    transform: translateX(calc(var(--sp-5) * 10 - var(--sp-4)));
  }
  .layer {
    display: block;
    width: calc(var(--depth) * 100%);
    height: var(--sp-3);
    border-radius: var(--radius-sm);
    background: var(--theme2);
  }
  .hint {
    margin: var(--sp-2) 0 0;
    font-size: var(--fs-xs);
  }
</style>
