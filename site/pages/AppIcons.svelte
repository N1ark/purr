<script lang="ts">
  import { Button, Segmented, copyText, toast } from "purr";
  import { GLYPH_CLASSES, PURPLE, composeIcon, composeTray, type IconColors } from "purr/app-icon";
  import dagobert from "../../src/app-icons/dagobert.svg?raw";
  import legit from "../../src/app-icons/legit.svg?raw";
  import purr from "../../src/app-icons/purr.svg?raw";
  import tulip from "../../src/app-icons/tulip.svg?raw";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const FAMILY = { legit, dagobert, tulip, purr } as const;
  type Name = keyof typeof FAMILY;
  const NAMES = Object.keys(FAMILY) as Name[];

  let name = $state<Name>("dagobert");
  let glyph = $state(FAMILY.dagobert);
  let colors = $state<IconColors>({ ...PURPLE });

  function pick(next: Name) {
    name = next;
    glyph = FAMILY[next];
  }

  // Images rather than inline SVG: the style rules inside an icon would otherwise reach the whole page.
  const url = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const icon = $derived(composeIcon(glyph, { colors }));
  const iconUrl = $derived(url(icon));
  const trayUrl = $derived(url(composeTray(glyph)));
  const family = $derived(
    NAMES.map((n) => ({ name: n, src: n === name ? iconUrl : url(composeIcon(FAMILY[n])) })),
  );
  const edited = $derived(glyph !== FAMILY[name]);

  function download(blob: Blob, file: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function downloadPng() {
    const img = new Image();
    img.src = iconUrl;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    canvas.getContext("2d")?.drawImage(img, 0, 0, 1024, 1024);
    canvas.toBlob((blob) => blob && download(blob, `${name}.png`), "image/png");
  }

  async function copyGlyph() {
    toast((await copyText(glyph)) ? "Glyph copied" : "Couldn't copy the glyph");
  }

  const SIZES = [128, 64, 32, 16];
</script>

<PageHeader
  title="App icons"
  description="One look for every app's icon, lifted from legit's: a rounded tile on Apple's grid, the purple diagonal with a glow, grain and a rim, and a white mark drawn with a few shared strokes. An app supplies only the mark; `purr-icon` builds the rest, and the menu-bar template from the same glyph."
  importLine={`npx purr-icon dagobert --out src-tauri/icons`}
  source="src/app-icon.js"
/>

<Section
  title="The family"
  description="Side by side, the way a dock shows them. Each glyph lives in `src/app-icons/`; the one being edited below stands in for its own."
>
  <div class="docks">
    {#each ["light", "dark"] as tone (tone)}
      <div class="dock {tone}">
        {#each family as app (app.name)}
          <button
            type="button"
            class="dock-icon"
            class:is-on={app.name === name}
            aria-pressed={app.name === name}
            title={app.name}
            onclick={() => pick(app.name)}><img src={app.src} alt={app.name} /></button
          >
        {/each}
      </div>
    {/each}
  </div>
</Section>

<Section
  title="Edit a glyph"
  description="Markup in a 1024 canvas whose tile spans 100–924. Draw with the classes below rather than colours or widths of your own, and keep the mark inside about 230–800, as legit's is."
>
  <div class="editor">
    <div class="side">
      <Segmented
        label="Glyph"
        options={NAMES.map((n) => ({ id: n, label: n }))}
        value={name}
        onchange={(id) => pick(id)}
      />
      <textarea
        class="field-input mono glyph"
        spellcheck="false"
        aria-label="Glyph markup"
        bind:value={glyph}></textarea>
      <div class="s-row">
        {#each ["from", "mid", "to"] as const as stop (stop)}
          <label class="stop"
            ><input type="color" bind:value={colors[stop]} aria-label="Gradient {stop}" />
            <span class="muted">{stop}</span></label
          >
        {/each}
        <Button size="sm" variant="ghost" onclick={() => (colors = { ...PURPLE })}>Purple</Button>
      </div>
      <div class="s-row">
        <Button
          size="sm"
          onclick={() => download(new Blob([icon], { type: "image/svg+xml" }), `${name}.svg`)}
          >SVG</Button
        >
        <Button size="sm" onclick={downloadPng}>PNG 1024</Button>
        <Button size="sm" onclick={copyGlyph}>Copy glyph</Button>
        {#if edited}<Button size="sm" variant="ghost" onclick={() => pick(name)}>Revert</Button
          >{/if}
      </div>
    </div>
    <div class="previews">
      <img class="big" src={iconUrl} alt="{name} icon" />
      <div class="sizes">
        {#each SIZES as size (size)}
          <figure>
            <img src={iconUrl} width={size} height={size} alt="{name} at {size}px" />
            <figcaption>{size}</figcaption>
          </figure>
        {/each}
      </div>
      <div class="bars">
        {#each ["light", "dark"] as tone (tone)}
          <div class="menubar {tone}" title="Menu bar, {tone}">
            <span class="tray" style:--tray="url('{trayUrl}')"></span>
            <span class="clock">9:41</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</Section>

<Section
  title="The marks"
  description="What a glyph is drawn with. `cut` is punched back out of a white shape in the tile's middle colour; in the menu bar it becomes a hole."
>
  <dl class="marks">
    {#each Object.entries(GLYPH_CLASSES) as [cls, rule] (cls)}
      <dt class="mono">.{cls}</dt>
      <dd class="mono muted">{rule}</dd>
    {/each}
  </dl>
</Section>

<Section
  title="In an app"
  description="The CLI takes a family name or a path to a glyph, and writes `icon.svg`, `tray.svg`, a 1024 `source.png` and a 128 `tray.png`; `tauri icon` makes every platform's sizes from the PNG."
  code={`npx purr-icon dagobert --out src-tauri/icons
npx tauri icon src-tauri/icons/source.png -o src-tauri/icons`}
>
  <p class="muted">
    From the app's root. The editor's PNG is the same file, for trying a glyph before committing it.
  </p>
</Section>

<style>
  .docks {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-4);
  }
  .dock {
    display: flex;
    gap: var(--gap-3);
    padding: var(--gap-4) var(--sp-4);
    border-radius: var(--radius-lg);
  }
  .dock.light {
    background: #e8e8ec;
  }
  .dock.dark {
    background: #2a2a2e;
  }
  .dock-icon {
    padding: 2px;
    border-radius: var(--radius-lg);
    transition: transform var(--dur) var(--ease);
  }
  .dock-icon img {
    display: block;
    width: 72px;
    height: 72px;
  }
  .dock-icon.is-on {
    box-shadow: 0 0 0 2px var(--theme2);
  }
  @media (hover: hover) {
    .dock-icon:hover {
      transform: translateY(-4px);
    }
  }
  .editor {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--sp-5);
    width: 100%;
  }
  @media (max-width: 900px) {
    .editor {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .side {
    display: flex;
    flex-direction: column;
    gap: var(--sp-3);
    min-width: 0;
  }
  .glyph {
    min-height: 260px;
    font-size: var(--fs-xs);
    line-height: 1.5;
    white-space: pre;
  }
  .stop {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
  }
  .stop input {
    width: 28px;
    height: 22px;
    padding: 0;
    border: none;
    background: none;
  }
  .previews {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }
  .big {
    width: 256px;
    height: 256px;
  }
  .sizes {
    display: flex;
    align-items: flex-end;
    gap: var(--sp-4);
  }
  figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-2);
    margin: 0;
  }
  figcaption {
    font-size: var(--fs-micro);
    color: var(--muted);
  }
  .bars {
    display: flex;
    gap: var(--sp-3);
  }
  .menubar {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    height: 26px;
    padding: 0 var(--sp-4);
    border-radius: var(--radius);
    font-size: var(--fs-xs);
  }
  .menubar.light {
    background: #ececec;
    color: #000;
  }
  .menubar.dark {
    background: #1e1e1e;
    color: #fff;
  }
  /* A template image: macOS paints it in the bar's text colour, through its alpha. */
  .tray {
    width: 18px;
    height: 18px;
    background: currentColor;
    -webkit-mask: var(--tray) center / contain no-repeat;
    mask: var(--tray) center / contain no-repeat;
  }
  .marks {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: var(--gap-3) var(--sp-4);
    margin: 0;
  }
  .marks dd {
    margin: 0;
    font-size: var(--fs-xs);
    overflow-wrap: anywhere;
  }
</style>
