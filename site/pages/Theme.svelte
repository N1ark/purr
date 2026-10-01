<script lang="ts">
  import {
    AA_TEXT,
    ACCENTS,
    IS_BROWSER,
    IS_TAURI,
    MOD,
    Segmented,
    Switch,
    Tag,
    accentById,
    accentVars,
    contrastRatio,
    currentTheme,
    detectMobile,
    isMac,
    isMobile,
    isMobileLayout,
    onThemeChange,
    os,
    tooltip,
    type Density,
    type ResolvedTheme,
  } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";
  import { look, setTouch, touch } from "../lib/site.svelte";

  const BACKGROUND: Record<ResolvedTheme, string> = { light: "#ffffff", dark: "#111111" };

  let changes = $state<string[]>([]);
  let painted = $state(currentTheme());
  $effect(() =>
    onThemeChange((theme) => {
      painted = theme;
      changes = [`${new Date().toLocaleTimeString()} → ${theme}`, ...changes].slice(0, 5);
    }),
  );

  const vars = $derived(accentVars(accentById(look.accent.value), look.theme.value));

  const call = $derived(
    `applyTheme({ mode: "${look.theme.value}", accent: "${look.accent.value}", density: "${look.density.value}" });`,
  );
</script>

<PageHeader
  title="Theme & platform"
  description={"`applyTheme` sets `html.dark`, the density class and the accent's custom properties; `mode: \"system\"` follows the OS until the next call, and `storageKey` lets `bootTheme` paint the right theme before the app's preferences load. The platform helpers say what the app is running on."}
  importLine={`import { applyTheme, ACCENTS, applyPlatform } from "purr";`}
  source="src/lib/theme.ts"
/>

<Section
  title="applyTheme"
  description="These drive the same state as the bar at the top: this site calls `applyTheme` whenever they change."
  code={call}
>
  <Segmented
    label="Theme"
    size="sm"
    options={[
      { id: "light", label: "Light" },
      { id: "dark", label: "Dark" },
    ]}
    bind:value={() => look.theme.value, (t: ResolvedTheme) => (look.theme.value = t)}
  />
  <Segmented
    label="Density"
    size="sm"
    options={[
      { id: "dense", label: "Dense" },
      { id: "compact", label: "Compact" },
      { id: "cozy", label: "Cozy" },
    ]}
    bind:value={() => look.density.value, (d: Density) => (look.density.value = d)}
  />
  <span class="s-out">currentTheme() = "{painted}"</span>
</Section>

<Section
  title="Accents"
  description="Each accent is a pair per theme, primary and hover. `--theme2` colours text (links, highlights), so its contrast against the theme's background is what has to hold. Click one to apply it."
  code={`ACCENTS.map((a) => accentSwatch(a.id, currentTheme()));`}
  block
>
  <table class="s-table">
    <thead>
      <tr><th>id</th><th>light</th><th>dark</th><th>--theme2 contrast (light / dark)</th></tr>
    </thead>
    <tbody>
      {#each ACCENTS as a (a.id)}
        {@const light = contrastRatio(a.light[1], BACKGROUND.light)}
        {@const dark = contrastRatio(a.dark[1], BACKGROUND.dark)}
        <tr>
          <td>
            <button
              type="button"
              class="pill"
              aria-pressed={look.accent.value === a.id}
              onclick={() => (look.accent.value = a.id)}>{a.label}</button
            >
          </td>
          <td>
            {#each a.light as c (c)}<span class="swatch swatch--round" style:--c={c} use:tooltip={c}
              ></span>{/each}
          </td>
          <td>
            {#each a.dark as c (c)}<span class="swatch swatch--round" style:--c={c} use:tooltip={c}
              ></span>{/each}
          </td>
          <td class="mono tabular">
            {light.toFixed(1)} / {dark.toFixed(1)}
            {#if Math.min(light, dark) < AA_TEXT}<Tag label="low" color="var(--danger)" />{/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</Section>

<Section
  title="accentVars"
  description="What an accent sets on `:root`: the two base colours and the tints derived from them, mirroring the ratios in `tokens.css`. The default purple sets nothing inline; the stylesheet already carries it."
  code={`accentVars(accentById("${look.accent.value}"), "${look.theme.value}")`}
  block
>
  <table class="s-table">
    <tbody>
      {#each Object.entries(vars) as [name, value] (name)}
        <tr>
          <td class="mono">{name}</td>
          <td><span class="swatch" style:--c={value}></span></td>
          <td class="mono muted">{value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Section>

<Section
  title="onThemeChange"
  description="Told whenever the painted theme flips, a system change included; returns the unsubscribe. Toggle the theme to see it."
  code={`$effect(() => onThemeChange((theme) => editor.setTheme(theme)));`}
>
  <div class="s-stack">
    {#each changes as line, i (i)}<span class="s-out">{line}</span>{:else}<span class="muted"
        >No change yet: press t.</span
      >{/each}
  </div>
</Section>

<Section
  title="Platform"
  description={"`applyPlatform({ mobile })` marks `html[data-os]` and turns on `body.mobile`: touch-sized targets, safe-area insets, keyboard tracking. The hand in the top bar (or `?mobile`) toggles it on this site."}
  code={`applyPlatform({ mobile: isMobile });`}
  block
>
  <div class="s-stack">
    <div class="s-row">
      <Switch label="Touch sizing" bind:checked={() => touch.on, (on: boolean) => setTouch(on)} />
      <span class="muted">body.mobile</span>
    </div>
    <table class="s-table">
      <tbody>
        <tr><th>os</th><td class="s-out">"{os}"</td></tr>
        <tr><th>isMac</th><td class="s-out">{isMac}</td></tr>
        <tr><th>MOD</th><td class="s-out">"{MOD}"</td></tr>
        <tr><th>IS_BROWSER</th><td class="s-out">{IS_BROWSER}</td></tr>
        <tr><th>IS_TAURI</th><td class="s-out">{IS_TAURI}</td></tr>
        <tr><th>isMobile (at start)</th><td class="s-out">{isMobile}</td></tr>
        <tr><th>detectMobile()</th><td class="s-out">{detectMobile()}</td></tr>
        <tr>
          <th>isMobileLayout()</th>
          <td class="s-out"
            >{#key touch.on}{isMobileLayout()}{/key}</td
          >
        </tr>
      </tbody>
    </table>
  </div>
</Section>

<style>
  .swatch {
    display: inline-block;
    vertical-align: middle;
  }
  .swatch + .swatch {
    margin-left: var(--gap-2);
  }
  .s-table th {
    width: 180px;
  }
</style>
