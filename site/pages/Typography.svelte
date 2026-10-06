<script lang="ts">
  // The type scale, the two families and the text utilities, all derived from `--font-size`.
  import { copyText, toast, tooltip } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const SCALE = [
    { name: "--fs-xl", use: "Page and dialog titles" },
    { name: "--fs-lg", use: "Section headings, a lead line" },
    { name: "--fs-base", use: "Body text: --font-size itself" },
    { name: "--fs-sm", use: "Rows, buttons, most controls" },
    { name: "--fs-xs", use: "Hints, tooltips, captions" },
    { name: "--fs-micro", use: "Small caps headings, badges" },
    { name: "--fs-nano", use: "The tiniest marks" },
  ];
  const WEIGHTS = [300, 400, 500, 600, 650, 700];

  async function copy(name: string) {
    if (await copyText(`var(${name})`)) toast(`Copied var(${name})`);
  }
</script>

<PageHeader
  title="Typography"
  description="Inter and Fira Code, from `purr/fonts.css`. Every size derives from `--font-size`, so density rescales everything."
  importLine={`import "purr/fonts.css";`}
  source="src/styles/tokens.css"
/>

<Section title="Scale" block>
  <table class="s-table">
    <tbody>
      {#each SCALE as step (step.name)}
        <tr>
          <td class="token">
            <button
              type="button"
              class="mono name"
              onclick={() => copy(step.name)}
              use:tooltip={"Copy var()"}>{step.name}</button
            >
          </td>
          <td
            ><span class="sample" style:font-size="var({step.name})">Purr keeps it consistent</span
            ></td
          >
          <td class="muted use">{step.use}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</Section>

<Section
  title="Families"
  description="--font is Inter Variable with a few character variants on; --mono is Fira Code, with ligatures."
  block
>
  <div class="s-grid families">
    <div class="s-stack">
      <span class="s-label">--font · Inter Variable</span>
      {#each WEIGHTS as weight (weight)}
        <span class="family" style:font-weight={weight}>{weight} · Quietly amazing 0123456789</span>
      {/each}
    </div>
    <div class="s-stack">
      <span class="s-label">--mono · Fira Code</span>
      {#each [400, 500, 600] as weight (weight)}
        <span class="family mono" style:font-weight={weight}
          >{weight} · {"const a = b => c !== d"}</span
        >
      {/each}
      <span class="family mono">{"-> <= >= != === && || ::"}</span>
    </div>
  </div>
</Section>

<Section
  title="Line height"
  description="--line-height: 1.45 compact, 1.55 cozy, 1.35 dense."
  block
>
  <p class="para">
    Body text at the base size and line height, long enough to wrap onto a second and a third line
    at most widths so the rhythm between lines shows.
  </p>
</Section>

<Section
  title="Text utilities"
  code={`<span class="muted">Secondary</span>
<span class="faint">Tertiary</span>
<span class="mono">src/index.ts</span>
<span class="tabular">1,234.50</span>
<span class="truncate">A label too long for its box…</span>
<kbd>⌘</kbd><kbd>K</kbd>`}
  block
>
  <div class="utils">
    <code class="mono util">.muted</code><span class="muted">Secondary text: details, hints</span>
    <code class="mono util">.faint</code><span class="faint"
      >Tertiary: placeholders, timestamps</span
    >
    <code class="mono util">.mono</code><span class="mono">src/components/Button.svelte</span>
    <code class="mono util">.tabular</code>
    <span class="tabular nums">1,111.11<br />9,999.99</span>
    <code class="mono util">.truncate</code>
    <span class="truncate narrow">A label long enough to be cut off at the end of its box</span>
    <code class="mono util">kbd</code><span
      ><kbd>⌘</kbd><kbd>⇧</kbd><kbd>K</kbd> · <kbd>Esc</kbd></span
    >
    <code class="mono util">::selection</code>
    <span>Select this text: the wash is the accent, translucent.</span>
  </div>
</Section>

<Section title="Headings in prose" description="Inside .md, headings step down from --fs-xl." block>
  <div class="md">
    <h1>Heading one</h1>
    <h2>Heading two</h2>
    <h3>Heading three</h3>
    <h4>Heading four</h4>
    <p>And a paragraph under them, with <strong>strong</strong> and <em>emphasis</em>.</p>
  </div>
</Section>

<style>
  .token {
    width: 1%;
    white-space: nowrap;
  }
  .name {
    padding: 0;
    font-size: var(--fs-sm);
    color: var(--color2);
  }
  @media (hover: hover) {
    .name:hover {
      color: var(--theme2);
    }
  }
  .sample {
    color: var(--color2);
  }
  .use {
    font-size: var(--fs-xs);
  }
  .family {
    font-size: var(--fs-lg);
    color: var(--color2);
  }
  .para {
    max-width: 70ch;
    margin: 0;
  }
  .utils {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    align-items: center;
    gap: var(--sp-4) var(--sp-5);
  }
  .nums {
    justify-self: start;
    text-align: right;
  }
  .util {
    font-size: var(--fs-sm);
    color: var(--theme2);
  }
  .families {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
  .narrow {
    display: block;
    max-width: 260px;
  }
  @media (max-width: 600px) {
    .use {
      display: none;
    }
  }
</style>
