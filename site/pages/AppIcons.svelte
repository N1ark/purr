<script lang="ts">
  import { Button, copyText, toast } from "purr";
  import { GLYPH_CLASSES, PURPLE, composeIcon, composeTray, type IconColors } from "purr/app-icon";
  import purr from "../../src/app-icons/purr.svg?raw";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let glyph = $state(purr);
  let colors = $state<IconColors>({ ...PURPLE });

  // Images rather than inline SVG: the style rules inside an icon would otherwise reach the whole page.
  const url = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const icon = $derived(composeIcon(glyph, { colors }));
  const iconUrl = $derived(url(icon));
  const trayUrl = $derived(url(composeTray(glyph)));
  const edited = $derived(glyph !== purr);

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
    canvas.toBlob((blob) => blob && download(blob, "icon.png"), "image/png");
  }

  async function copyGlyph() {
    toast((await copyText(glyph)) ? "Glyph copied" : "Couldn't copy the glyph");
  }

  const SIZES = [128, 64, 32, 16];
</script>

<PageHeader
  title="App icons"
  description="One icon style: a rounded tile with a purple diagonal, glow and rim around a white mark. An app supplies the mark; `purr-icon` builds the rest."
  importLine={`npx purr-icon path/to/glyph.svg --out src-tauri/icons`}
  source="src/app-icon.js"
/>

<Section
  title="Edit a glyph"
  description="SVG markup on a 1024 canvas (tile 100–924). Draw with the classes below and keep the mark within about 230–800."
>
  <div class="editor">
    <div class="side">
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
          onclick={() => download(new Blob([icon], { type: "image/svg+xml" }), "icon.svg")}
          >SVG</Button
        >
        <Button size="sm" onclick={downloadPng}>PNG 1024</Button>
        <Button size="sm" onclick={copyGlyph}>Copy glyph</Button>
        {#if edited}<Button size="sm" variant="ghost" onclick={() => (glyph = purr)}>Revert</Button
          >{/if}
      </div>
    </div>
    <div class="previews">
      <img class="big" src={iconUrl} alt="The icon" />
      <div class="sizes">
        {#each SIZES as size (size)}
          <figure>
            <img src={iconUrl} width={size} height={size} alt="At {size}px" />
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
  description="`cut` punches back out of a white shape; in the menu bar it becomes a hole."
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
  description="From the app's root: writes `icon.svg`, `tray.svg`, `source.png` (1024) and `tray.png` (128); `tauri icon` makes the rest."
  code={`npx purr-icon path/to/glyph.svg --out src-tauri/icons
npx tauri icon src-tauri/icons/source.png -o src-tauri/icons`}
>
  <span class="muted">The editor's PNG is the same file.</span>
</Section>

<style>
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
