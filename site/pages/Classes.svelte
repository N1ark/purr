<script lang="ts">
  // The global classes, each rendered from the very snippet shown under it.
  import { Badge, Tag } from "purr";
  import { ArrowsClockwise, Gear, Hash, PencilSimple, Trash } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";
  import { href } from "../lib/site.svelte";

  interface Demo {
    title: string;
    description: string;
    code: string;
  }

  const BUTTONS: Demo[] = [
    {
      title: ".btn",
      description: "A bare button is reset; .btn plus a variant makes it look like one.",
      code: `<button class="btn">Default</button>
<button class="btn btn--primary">Primary</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--danger">Danger</button>
<button class="btn btn--ghost btn--danger">Ghost danger</button>
<button class="btn btn--link">Link</button>
<button class="btn" disabled>Disabled</button>`,
    },
    {
      title: "Sizes and states",
      description: "Engaged is aria-pressed, aria-expanded or .is-on.",
      code: `<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>
<button class="btn" aria-pressed="true">Pressed</button>
<button class="btn btn--ghost is-on">Engaged ghost</button>
<button class="btn" aria-expanded="true">Menu open</button>
<button class="btn btn--primary">Send <kbd>⌘↩</kbd></button>`,
    },
  ];

  const FIELDS: Demo = {
    title: ".field-input",
    description: "Inputs, selects and textareas; aria-invalid or .is-invalid marks an error.",
    code: `<input class="field-input" placeholder="A field" />
<input class="field-input is-invalid" aria-invalid="true" value="not-an-email" />
<input class="field-input" value="Disabled" disabled />
<select class="field-input">
  <option>Everyone</option>
  <option>Only me</option>
</select>
<textarea class="field-input" rows="2">A textarea grows vertically</textarea>`,
  };

  const CHECKBOXES: Demo = {
    title: ".checkbox",
    description: "On a real checkbox, or anything with aria-checked or .is-on.",
    code: `<input type="checkbox" class="checkbox" checked aria-label="Checked" />
<input type="checkbox" class="checkbox" aria-label="Unchecked" />
<input type="checkbox" class="checkbox" checked disabled aria-label="Disabled" />
<button class="checkbox" role="checkbox" aria-checked="true" aria-label="A button"></button>
<button class="checkbox" role="checkbox" aria-checked="mixed" aria-label="Mixed"></button>
<span class="checkbox is-on"></span>`,
  };

  const LABELS: Demo[] = [
    {
      title: ".tag",
      description: "--tag tints it; unset it is neutral. .tag--caps for labels like BOT.",
      code: `<span class="tag">neutral</span>
<span class="tag tag--caps">bot</span>
<span class="tag tag--caps" style="--tag: var(--theme2)">you</span>
<span class="tag" style="--tag: var(--success)">merged</span>
<span class="tag" style="--tag: #61afef">design</span>
<span class="tag" style="--tag: #e5c07b">later</span>`,
    },
    {
      title: ".swatch",
      description: "A colour from --c; .swatch--round for a dot. Pressed rings it.",
      code: `<button class="swatch" style="--c: #e06c75" aria-label="Red"></button>
<button class="swatch" style="--c: #98c379" aria-label="Green" aria-pressed="true"></button>
<button class="swatch" style="--c: #61afef" aria-label="Blue"></button>
<button class="swatch swatch--round" style="--c: #c678dd" aria-label="Purple"></button>
<button class="swatch swatch--round" style="--c: #e5c07b" aria-label="Yellow" aria-pressed="true"></button>
<span class="swatch" style="--c: var(--theme)"></span>`,
    },
  ];

  const TEXT: Demo = {
    title: "Layout and text",
    description:
      ".truncate, .rule (a hairline beside a heading), .sr-only, .selectable and .hoverable.",
    code: `<div style="display: flex; align-items: center; gap: var(--gap-4); width: 100%">
  <span class="faint">Section</span>
  <span class="rule"></span>
</div>
<span class="truncate" style="max-width: 220px">A name long enough to be cut off at the end</span>
<span class="hoverable" style="padding: var(--gap-2) var(--sp-3); border-radius: var(--radius)">Hover me</span>
<span class="selectable">Selectable text</span>
<span class="sr-only">Only a screen reader sees this.</span>`,
  };

  const SURFACE: Demo = {
    title: ".surface",
    description: "A raised sheet for popovers, cards and menus.",
    code: `<div class="surface" style="padding: var(--sp-4) var(--sp-5)">A raised sheet</div>
<div class="surface" style="padding: var(--sp-4) var(--sp-5)">
  <span class="muted">.muted</span> · <span class="faint">.faint</span> ·
  <span class="mono">.mono</span> · <span class="tabular">1,234.50</span>
</div>`,
  };

  const FOCUS: Demo = {
    title: ".focus-frame",
    description: "Draws a scroller's focus ring above its rows. Tab into both to compare.",
    code: `<div class="surface scroller" tabindex="0" role="region" aria-label="Without a frame">
  <div class="row-item is-current">Without a frame</div>
  <div class="row-item">Inbox</div>
  <div class="row-item">Archive</div>
</div>
<div class="focus-frame">
  <div class="surface scroller" tabindex="0" role="region" aria-label="With a frame">
    <div class="row-item is-current">With .focus-frame</div>
    <div class="row-item">Inbox</div>
    <div class="row-item">Archive</div>
  </div>
</div>`,
  };

  let pills = $state({ unread: true, archived: false, starred: false });
</script>

{#snippet demo(d: Demo)}
  <Section title={d.title} description={d.description} code={d.code}>
    {@html d.code}
  </Section>
{/snippet}

<PageHeader
  title="Classes"
  description="Global classes from `classes.css`. Bare elements are reset; state is `.is-current` (selected), `.is-on` (engaged) and `.is-cursor` (keyboard cursor)."
  importLine={`import "purr/styles.css";`}
  source="src/styles/classes.css"
/>

{#each BUTTONS as d (d.title)}{@render demo(d)}{/each}

<Section
  title=".btn--icon"
  description="Square, for one icon. IconButton adds the tooltip and label."
  code={`<button class="btn btn--icon btn--ghost btn--sm" aria-label="Edit"><PencilSimple /></button>
<button class="btn btn--icon btn--ghost" aria-label="Settings"><Gear /></button>
<button class="btn btn--icon btn--ghost btn--lg" aria-label="Refresh"><ArrowsClockwise /></button>
<button class="btn btn--icon" aria-label="Settings"><Gear /></button>
<button class="btn btn--icon btn--ghost btn--danger" aria-label="Delete"><Trash /></button>`}
>
  <button class="btn btn--icon btn--ghost btn--sm" aria-label="Edit"><PencilSimple /></button>
  <button class="btn btn--icon btn--ghost" aria-label="Settings"><Gear /></button>
  <button class="btn btn--icon btn--ghost btn--lg" aria-label="Refresh"><ArrowsClockwise /></button>
  <button class="btn btn--icon" aria-label="Settings"><Gear /></button>
  <button class="btn btn--icon btn--ghost btn--danger" aria-label="Delete"><Trash /></button>
</Section>

<Section
  title=".row-item"
  description="One clickable line in a list. .fills lets a row share its line."
  code={`<button class="row-item"><Hash /> <span class="truncate">general</span></button>
<button class="row-item is-current" aria-current="page">
  <Hash /> <span class="truncate fills">design</span> <Badge count={3} />
</button>
<button class="row-item is-cursor">
  <Hash /> <span class="truncate">a channel with a name long enough to truncate</span>
</button>
<div class="row-item">
  <span class="truncate fills">Ada Lovelace</span> <Tag label="bot" caps />
</div>`}
>
  <div class="rows surface">
    <button class="row-item"><Hash /> <span class="truncate">general</span></button>
    <button class="row-item is-current" aria-current="page">
      <Hash /> <span class="truncate fills">design</span>
      <Badge count={3} />
    </button>
    <button class="row-item is-cursor">
      <Hash /> <span class="truncate">a channel with a name long enough to truncate</span>
    </button>
    <div class="row-item">
      <span class="truncate fills">Ada Lovelace</span>
      <Tag label="bot" caps />
    </div>
  </div>
</Section>

{@render demo(FIELDS)}
{@render demo(CHECKBOXES)}

{@render demo(LABELS[0])}

<Section
  title=".pill"
  description="A capsule toggle, on with aria-pressed or .is-on. Chip is the component."
  code={`<button class="pill" aria-pressed={unread} onclick={() => (unread = !unread)}>Unread</button>`}
>
  {#each Object.keys(pills) as key (key)}
    {@const k = key as keyof typeof pills}
    <button
      type="button"
      class="pill"
      aria-pressed={pills[k]}
      onclick={() => (pills[k] = !pills[k])}>{key[0].toUpperCase() + key.slice(1)}</button
    >
  {/each}
</Section>

{@render demo(LABELS[1])}
{@render demo(SURFACE)}
{@render demo(TEXT)}

<Section
  title=".spin"
  description="Spins an icon while busy; put it on the icon, not the button."
  code={`<span class="spin"><ArrowsClockwise /></span>`}
>
  <span class="spin"><ArrowsClockwise /></span>
  <button type="button" class="btn"><span class="spin"><ArrowsClockwise /></span> Syncing</button>
</Section>

<Section title={FOCUS.title} description={FOCUS.description} code={FOCUS.code}>
  <div class="frames">{@html FOCUS.code}</div>
</Section>

<Section
  title="Overlay classes"
  description="overlays.css styles the tooltip bubble and the drag-to-reorder marks (.dnd-*)."
>
  <a class="btn" href={href("tooltip")}>tooltip</a>
  <a class="btn" href={href("drag-list")}>dragList</a>
</Section>

<style>
  .rows {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    width: 100%;
    max-width: 360px;
    padding: var(--sp-2);
    --ring-bg: var(--surface);
  }
  .frames {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-5);
  }
  .frames :global(.scroller) {
    width: 220px;
    height: 76px;
    padding: var(--sp-2);
    overflow-y: auto;
    box-shadow: none;
  }
  .frames :global(.focus-frame .scroller) {
    width: 220px;
  }
</style>
