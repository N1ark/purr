<script lang="ts" module>
  /** Pages drawn here rather than rendered live. */
  export const SKETCHED = new Set([
    "action-sheet",
    "app-icons",
    "classes",
    "color",
    "command-palette",
    "context-menu-host",
    "dialog-host",
    "dialogs",
    "drag-list",
    "focus",
    "fuzzy",
    "icons",
    "keymap",
    "lightbox",
    "live-region",
    "markdown",
    "menu",
    "misc",
    "modal",
    "persisted",
    "popover",
    "resizer",
    "sheet",
    "shortcuts",
    "shortcuts-overlay",
    "theme",
    "theme-script",
    "time",
    "toast",
    "toast-host",
    "tokens",
    "tooltip",
    "typography",
    "updates",
  ]);
</script>

<script lang="ts">
  // Drawn thumbnails for what has no picture at rest: overlays, actions, utilities.
  import { Highlight, Kbd, colorFromSeed, formatRelative } from "purr";
  import { composeIcon } from "purr/app-icon";
  import {
    ArrowCircleUp,
    Bell,
    Check,
    CircleHalf,
    Clipboard,
    Cursor,
    DotsSixVertical,
    DotsThree,
    Folder,
    Gear,
    HardDrives,
    Heart,
    Image,
    MagnifyingGlass,
    Moon,
    SpeakerHigh,
    Star,
    Sun,
  } from "purr/icons";
  import glyph from "../../src/app-icons/purr.svg?raw";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  const appIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(composeIcon(glyph))}`;
  const TONES = ["theme", "info", "success", "warn", "danger"];
</script>

{#snippet lines(n: number, widths = [70, 90, 55, 80])}
  {#each { length: n }, i (i)}<span class="line" style:width="{widths[i % widths.length]}%"
    ></span>{/each}
{/snippet}

{#snippet rows(n: number, cursor = -1)}
  {#each { length: n }, i (i)}
    <span class="row" class:on={i === cursor}>{@render lines(1, [[60, 80, 50, 70][i % 4]])}</span>
  {/each}
{/snippet}

{#if slug === "modal"}
  <div class="win scrim">
    <div class="card center modal">
      <span class="line head" style:width="50%"></span>
      {@render lines(2)}
      <span class="foot"><span class="btn btn--primary btn--sm">OK</span></span>
    </div>
  </div>
{:else if slug === "sheet"}
  <div class="win scrim">
    <div class="card bottom sheet"><span class="grab"></span>{@render lines(2)}</div>
  </div>
{:else if slug === "action-sheet"}
  <div class="win scrim">
    <div class="stack bottom">
      <div class="card">{@render rows(3)}</div>
      <div class="card">{@render rows(1)}</div>
    </div>
  </div>
{:else if slug === "popover"}
  <div class="col">
    <span class="btn btn--sm">Edit</span>
    <div class="card pop">{@render lines(3)}</div>
  </div>
{:else if slug === "menu"}
  <div class="col">
    <span class="btn btn--icon btn--sm is-on"><DotsThree /></span>
    <div class="card menu">{@render rows(3, 1)}</div>
  </div>
{:else if slug === "context-menu-host"}
  <div class="ctx">
    <span class="cursor"><Cursor weight="fill" /></span>
    <div class="card menu">{@render rows(4, 0)}</div>
  </div>
{:else if slug === "command-palette"}
  <div class="card palette">
    <span class="search"><MagnifyingGlass />{@render lines(1, [45])}</span>
    {@render rows(3, 0)}
  </div>
{:else if slug === "dialog-host" || slug === "dialogs"}
  <div class="card dialog">
    <span class="line head" style:width="60%"></span>
    {@render lines(1, [85])}
    <span class="foot">
      <span class="btn btn--sm">Cancel</span><span class="btn btn--primary btn--sm">OK</span>
    </span>
  </div>
{:else if slug === "toast-host" || slug === "toast"}
  <div class="win">
    <div class="card toast"><Check />{@render lines(1, [100])}</div>
  </div>
{:else if slug === "lightbox"}
  <div class="win dark"><span class="picture"><Image weight="duotone" /></span></div>
{:else if slug === "shortcuts-overlay"}
  <div class="card keys">
    {#each ["⌘K", "j", "g i"] as hint (hint)}
      <span class="key"><Kbd {hint} />{@render lines(1, [60])}</span>
    {/each}
  </div>
{:else if slug === "tooltip"}
  <div class="col">
    <span class="tip">Settings <kbd>⌘,</kbd></span>
    <span class="btn btn--icon"><Gear /></span>
  </div>
{:else if slug === "drag-list"}
  <div class="card list">
    {#each [0, 1, 2] as i (i)}
      <span class="row" class:lifted={i === 1}
        ><DotsSixVertical />{@render lines(1, [[60, 75, 50][i]])}</span
      >
    {/each}
  </div>
{:else if slug === "focus"}
  <div class="col">
    <span class="field-input focused">{@render lines(1, [40])}</span>
    <Kbd hint="⇥" />
  </div>
{:else if slug === "resizer"}
  <div class="win split">
    <span class="pane"></span><span class="edge"></span><span class="pane"></span>
  </div>
{:else if slug === "shortcuts"}
  <span class="big"><Kbd hint="⇧⌘K" /></span>
{:else if slug === "keymap"}
  <span class="big"><Kbd hint="g i" /></span>
{:else if slug === "fuzzy"}
  <span class="big"><Highlight text="SettingsLayout" indices={[0, 8, 9]} /></span>
{:else if slug === "time"}
  <span class="big muted">{formatRelative(Date.now() - 5 * 60_000)}</span>
{:else if slug === "theme"}
  <span class="glyphs"><Sun /><Moon /></span>
{:else if slug === "theme-script"}
  <span class="glyphs"><CircleHalf weight="fill" /></span>
{:else if slug === "color"}
  <span class="dots">
    {#each [1, 2, 3, 4, 5] as seed (seed)}
      <span class="swatch swatch--round" style:background={colorFromSeed(seed, 0.12, 0.6)}></span>
    {/each}
  </span>
{:else if slug === "tokens"}
  <span class="dots">
    {#each TONES as tone (tone)}
      <span class="swatch" style:background="var(--{tone})"></span>
    {/each}
  </span>
{:else if slug === "typography"}
  <span class="type"><span>Aa</span><span class="mono">Aa</span></span>
{:else if slug === "classes"}
  <span class="dots">
    <span class="btn btn--sm">.btn</span><span class="pill is-on">.pill</span><span class="tag"
      >.tag</span
    >
  </span>
{:else if slug === "markdown"}
  <div class="md-sketch">
    <span class="line head" style:width="45%"></span>
    {@render lines(2)}
    <span class="code">{@render lines(1, [50])}</span>
  </div>
{:else if slug === "icons"}
  <span class="glyphs small"><Heart /><Star /><Bell /><Folder /><Gear /></span>
{:else if slug === "app-icons"}
  <img class="app" src={appIcon} alt="" />
{:else if slug === "updates"}
  <span class="glyphs"><ArrowCircleUp /></span>
{:else if slug === "persisted"}
  <span class="glyphs"><HardDrives /></span>
{:else if slug === "misc"}
  <span class="glyphs"><Clipboard /></span>
{:else if slug === "live-region"}
  <span class="glyphs"><SpeakerHigh /></span>
{/if}

<style>
  .line {
    display: block;
    height: 5px;
    border-radius: var(--radius-pill);
    background: var(--bg4);
  }
  .line.head {
    height: 6px;
    background: var(--border-strong);
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-3);
    padding: var(--sp-3);
    border-radius: var(--radius-lg);
    background: var(--surface);
    box-shadow: var(--shadow-lg);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    height: 14px;
    padding: 0 var(--gap-3);
    border-radius: var(--radius-sm);
    color: var(--faint);
    font-size: var(--fs-micro);
  }
  .row .line {
    flex: 1;
  }
  .row.on {
    background: var(--theme-soft);
  }
  .row.on .line {
    background: var(--theme-mid);
  }
  .win {
    position: relative;
    width: 160px;
    height: 80px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg2);
    overflow: hidden;
  }
  .win.scrim::before,
  .win.dark::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--scrim);
  }
  .win.dark::before {
    background: var(--scrim-strong);
  }
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
  }
  .bottom {
    position: absolute;
    right: var(--sp-3);
    bottom: var(--sp-2);
    left: var(--sp-3);
  }
  .modal {
    width: 90px;
  }
  .sheet {
    right: 0;
    bottom: 0;
    left: 0;
    height: 50px;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  .grab {
    align-self: center;
    width: 20px;
    height: 3px;
    border-radius: var(--radius-pill);
    background: var(--border-strong);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
  }
  .stack .card {
    gap: 0;
    padding: var(--gap-1);
  }
  .foot {
    display: flex;
    justify-content: flex-end;
    gap: var(--gap-2);
    margin-top: var(--gap-2);
  }
  .foot .btn {
    height: 14px;
    padding: 0 var(--gap-3);
    font-size: var(--fs-nano);
  }
  .col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-3);
  }
  .pop {
    width: 110px;
  }
  .menu {
    width: 100px;
    gap: var(--gap-1);
    padding: var(--gap-2);
  }
  .ctx {
    position: relative;
    padding: var(--sp-3) 0 0 var(--sp-4);
  }
  .cursor {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    color: var(--color2);
    font-size: var(--icon-lg);
  }
  .palette {
    width: 150px;
    gap: var(--gap-1);
  }
  .search {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    padding: 0 var(--gap-3) var(--gap-3);
    border-bottom: 1px solid var(--border);
    color: var(--muted);
    font-size: var(--icon-sm);
  }
  .search .line {
    flex: 1;
  }
  .dialog {
    width: 130px;
  }
  .toast {
    position: absolute;
    bottom: var(--sp-3);
    left: 50%;
    translate: -50% 0;
    flex-direction: row;
    align-items: center;
    width: 90px;
    padding: var(--gap-3) var(--sp-3);
    border-radius: var(--radius-pill);
    color: var(--success);
    font-size: var(--icon-sm);
  }
  .toast .line {
    flex: 1;
  }
  .picture {
    position: absolute;
    inset: var(--sp-3) 40px;
    display: grid;
    place-items: center;
    border-radius: var(--radius);
    background: var(--bg3);
    color: var(--muted);
    font-size: calc(var(--icon-lg) * 2);
  }
  .keys {
    width: 130px;
  }
  .key {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    font-size: var(--fs-xs);
  }
  .key :global(.kbd) {
    min-width: 30px;
  }
  .key .line {
    flex: 1;
  }
  .tip {
    padding: var(--gap-1) var(--gap-3);
    border-radius: var(--radius-sm);
    background: var(--surface);
    box-shadow: var(--shadow-lg);
    font-size: var(--fs-xs);
    color: var(--color2);
  }
  .tip kbd {
    margin-left: var(--gap-3);
    padding: 0;
    background: none;
    box-shadow: none;
    color: var(--muted);
  }
  .list {
    width: 130px;
    gap: var(--gap-2);
    padding: var(--gap-3);
  }
  .list .row {
    height: 18px;
    background: var(--bg2);
  }
  .list .row.lifted {
    translate: var(--sp-3) 0;
    background: var(--surface);
    box-shadow: var(--shadow-lg);
  }
  .focused {
    display: flex;
    align-items: center;
    width: 120px;
    height: var(--btn);
    border-color: var(--theme);
    box-shadow: 0 0 0 2px var(--theme-mid);
  }
  .split {
    display: flex;
  }
  .pane {
    flex: 1;
  }
  .pane:first-child {
    flex: 0 0 55px;
    background: var(--bg3);
  }
  .edge {
    width: 3px;
    background: var(--theme2);
  }
  .big {
    font-size: var(--fs-xl);
    color: var(--color2);
  }
  .big :global(.kbd) {
    zoom: 1.6;
  }
  .glyphs {
    display: flex;
    gap: var(--sp-4);
    color: var(--muted);
    font-size: calc(var(--icon-lg) * 2.4);
  }
  .glyphs.small {
    font-size: calc(var(--icon-lg) * 1.6);
  }
  .dots {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
  }
  .type {
    display: flex;
    align-items: baseline;
    gap: var(--sp-4);
    font-size: calc(var(--fs-xl) * 2);
    font-weight: 600;
    color: var(--color2);
  }
  .type .mono {
    font-size: calc(var(--fs-xl) * 1.4);
    font-weight: 400;
    color: var(--theme2);
  }
  .md-sketch {
    display: flex;
    flex-direction: column;
    gap: var(--gap-3);
    width: 130px;
  }
  .code {
    padding: var(--gap-3);
    border-radius: var(--radius);
    background: var(--code-bg);
    box-shadow: inset 0 0 0 1px var(--border);
  }
  .code .line {
    background: var(--theme-mid);
  }
  .app {
    width: 72px;
    height: 72px;
  }
</style>
