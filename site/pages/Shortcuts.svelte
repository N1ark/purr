<script lang="ts">
  import {
    Kbd,
    MOD,
    Tag,
    accelerator,
    formatShortcut,
    isMac,
    matches,
    os,
    parseShortcut,
    shortcutParts,
    shortcutSteps,
  } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const SAMPLES = ["⌘K", "⇧⌘K", "⌘↩", "⌥↓", "↩", "?", "j", "⇧J", "Esc", "⌃Tab", "⌘1", "⌥⌘P"];

  let pressed = $state<KeyboardEvent | null>(null);
  const hits = $derived(new Set(pressed ? SAMPLES.filter((h) => matches(h, pressed!)) : []));

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Tab" && !e.ctrlKey) return;
    e.preventDefault();
    e.stopPropagation();
    pressed = e;
  }

  let hint = $state("⇧⌘K");
  const parsed = $derived.by(() => {
    try {
      return shortcutSteps(hint).map((step) => parseShortcut(step));
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  });
  const accel = $derived.by(() => {
    try {
      return accelerator(hint) ?? "undefined (a chord)";
    } catch {
      return "—";
    }
  });

  const mods = (e: KeyboardEvent) =>
    [e.metaKey && "meta", e.ctrlKey && "ctrl", e.altKey && "alt", e.shiftKey && "shift"]
      .filter(Boolean)
      .join(" + ") || "none";
</script>

<PageHeader
  title="Shortcuts"
  description="One string per shortcut, written the way a Mac menu writes it: `⇧⌘K`, `⌥↓`, `↩`, `j`, a chord as `g i`. `⌘` is the platform modifier (Ctrl off a Mac), `⌃` a literal Control. The same hint drives `matches`, `formatShortcut`, `Kbd` and the help overlay."
  importLine={`import { formatShortcut, matches, shortcutParts, Kbd } from "purr";`}
  source="src/lib/keys.ts"
/>

<Section
  title="matches"
  description="Focus the box and press keys: every sample hint the keypress `matches` lights up. `⌘` accepts Ctrl as well as ⌘, and a key that is already shifted (`?`) does not need `⇧`."
  code={`function onkeydown(e: KeyboardEvent) {
  if (matches("⇧⌘K", e)) openCommands();
  else if (matches("?", e)) showHelp();
}`}
>
  <div class="s-stack fill">
    <div
      class="pad s-box"
      role="textbox"
      tabindex="0"
      aria-label="Press keys here"
      onkeydown={onKeydown}
    >
      {#if pressed}
        <span class="s-out">
          key <b>{JSON.stringify(pressed.key)}</b> · code {pressed.code} · modifiers {mods(pressed)}
        </span>
      {:else}
        <span class="muted">Click here, then press a shortcut</span>
      {/if}
    </div>
    <div class="s-row">
      {#each SAMPLES as sample (sample)}
        <span class="sample" class:hit={hits.has(sample)}>
          <Tag label={sample} color={hits.has(sample) ? "var(--success)" : undefined} />
        </span>
      {/each}
    </div>
  </div>
</Section>

<Section
  title="Formatting"
  description="Type a hint: `formatShortcut` writes it for a Mac or for everyone else, `shortcutParts` gives one string per chord step (what `Kbd` draws), `parseShortcut` reads one step and `accelerator` turns it into Tauri's menu syntax."
  code={`formatShortcut("${hint}", { mac: true })  // ${JSON.stringify(formatShortcut(hint, { mac: true }))}
formatShortcut("${hint}", { mac: false }) // ${JSON.stringify(formatShortcut(hint, { mac: false }))}
shortcutParts("${hint}")                  // ${JSON.stringify(shortcutParts(hint))}
accelerator("${hint}")                    // ${JSON.stringify(accel)}`}
>
  <div class="s-stack fill">
    <div class="s-row">
      <input class="field-input hint-input" aria-label="Hint" bind:value={hint} />
      {#each ["⇧⌘K", "⌥⌘↑", "g i", "⌃⇧Tab", "⌘,", "Space"] as h (h)}
        <button type="button" class="pill" onclick={() => (hint = h)}>{h}</button>
      {/each}
    </div>
    <table class="s-table">
      <tbody>
        <tr><th>Kbd</th><td><Kbd {hint} /></td></tr>
        <tr><th>On a Mac</th><td class="s-out">{formatShortcut(hint, { mac: true })}</td></tr>
        <tr><th>Elsewhere</th><td class="s-out">{formatShortcut(hint, { mac: false })}</td></tr>
        <tr><th>accelerator</th><td class="s-out">{accel}</td></tr>
        <tr>
          <th>parseShortcut</th>
          <td class="s-out">
            {#if typeof parsed === "string"}
              <span class="danger">{parsed}</span>
            {:else}
              {#each parsed as step, i (i)}<div>{JSON.stringify(step)}</div>{/each}
            {/if}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</Section>

<Section
  title="This platform"
  description="`os` comes from the user agent, so a browser build and a screenshot behave like the app. `MOD` is the modifier as words would write it."
  code={`import { MOD, isMac, os } from "purr";`}
>
  <span class="s-out">os = "{os}"</span>
  <span class="s-out">isMac = {isMac}</span>
  <span class="s-out">MOD = "{MOD}"</span>
  <span class="muted">· <Kbd hint="⇧⌘K" /> here</span>
</Section>

<style>
  .fill {
    width: 100%;
  }
  .pad {
    display: flex;
    align-items: center;
    min-height: 64px;
    cursor: text;
  }
  .pad:focus-visible {
    outline: 1px solid var(--theme2);
    outline-offset: 1px;
  }
  .sample {
    display: inline-flex;
    transition: transform var(--dur) var(--ease);
  }
  .sample.hit {
    transform: scale(1.15);
  }
  .hint-input {
    width: 140px;
  }
  .s-table th {
    width: 140px;
  }
  .danger {
    color: var(--danger);
  }
</style>
