<script lang="ts">
  import {
    AA_NON_TEXT,
    AA_TEXT,
    Avatar,
    Tag,
    colorFromSeed,
    contrastRatio,
    hashString,
    initials,
    parseColor,
    readableOn,
    relativeLuminance,
    toHex,
    tooltip,
  } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let fg = $state("#8a2aa2");
  let bg = $state("#ffffff");

  const safe = <T,>(fn: () => T): T | null => {
    try {
      return fn();
    } catch {
      return null;
    }
  };

  const ratio = $derived(safe(() => contrastRatio(fg, bg)));
  const fgLum = $derived(safe(() => relativeLuminance(fg)));
  const bgLum = $derived(safe(() => relativeLuminance(bg)));
  const ink = $derived(safe(() => readableOn(bg)) ?? "#111");

  let parseInput = $state("hsl(280 60% 40%)");
  const parsed = $derived.by(() => {
    try {
      const rgb = parseColor(parseInput);
      return { rgb, hex: toHex(rgb) };
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  });

  let name = $state("Ada Lovelace");
  const seed = $derived(hashString(name));

  const TAGS = ["#b045ab", "#61afef", "#e5c07b", "#98c379", "#1d1d1d", "#f0f0f0"];
</script>

<PageHeader
  title="Colour"
  description="The small amount of colour maths the apps need: WCAG contrast for a user's tag colours, black-or-white text on them, and a stable colour from a name for avatars without a picture."
  importLine={`import { contrastRatio, readableOn, colorFromSeed, initials } from "purr";`}
  source="src/lib/color.ts"
/>

<Section
  title="contrastRatio"
  description="Between 1 (identical) and 21 (black on white), whichever way round. `AA_TEXT` (4.5) is the floor for body text, `AA_NON_TEXT` (3) for icons and rules."
  code={`contrastRatio("${fg}", "${bg}") // ${ratio?.toFixed(2) ?? "throws"}
relativeLuminance("${fg}")        // ${fgLum?.toFixed(3) ?? "throws"}`}
>
  <div class="s-stack fill">
    <div class="s-row">
      <label class="s-row pick"
        ><input type="color" bind:value={fg} aria-label="Foreground picker" />
        <input class="field-input hex" aria-label="Foreground" bind:value={fg} /></label
      >
      <span class="muted">on</span>
      <label class="s-row pick"
        ><input type="color" bind:value={bg} aria-label="Background picker" />
        <input class="field-input hex" aria-label="Background" bind:value={bg} /></label
      >
    </div>
    <div class="sample" style:background={bg} style:color={fg}>
      <span class="big">Aa</span>
      <span>The quick brown fox, set in the foreground colour.</span>
    </div>
    <div class="s-row">
      <span class="s-out">{ratio === null ? "—" : `${ratio.toFixed(2)} : 1`}</span>
      {#if ratio !== null}
        <Tag
          label="text {ratio >= AA_TEXT ? 'passes' : 'fails'}"
          color={ratio >= AA_TEXT ? "var(--success)" : "var(--danger)"}
        />
        <Tag
          label="non-text {ratio >= AA_NON_TEXT ? 'passes' : 'fails'}"
          color={ratio >= AA_NON_TEXT ? "var(--success)" : "var(--danger)"}
        />
      {/if}
      <span class="muted">luminance {fgLum?.toFixed(3) ?? "—"} / {bgLum?.toFixed(3) ?? "—"}</span>
    </div>
  </div>
</Section>

<Section
  title="readableOn"
  description="Black or white, whichever reads better on a background: a tag chip in a colour the user picked."
  code={`<span style:background={color} style:color={readableOn(color)}>{name}</span>`}
>
  <span class="chip" style:background={bg} style:color={ink}>on your background</span>
  {#each TAGS as color (color)}
    <span class="chip" style:background={color} style:color={readableOn(color)}>{color}</span>
  {/each}
</Section>

<Section
  title="parseColor and toHex"
  description="Reads `#rgb`, `#rrggbb`, `#rrggbbaa` (alpha ignored) and `hsl()`; throws on anything else."
  code={`parseColor("${parseInput}") // ${typeof parsed === "string" ? "throws" : JSON.stringify(parsed.rgb)}
toHex(rgb)                       // ${typeof parsed === "string" ? "—" : JSON.stringify(parsed.hex)}`}
>
  <input class="field-input wide" aria-label="Colour to parse" bind:value={parseInput} />
  {#if typeof parsed === "string"}
    <span class="s-out danger">{parsed}</span>
  {:else}
    <span class="swatch" style:--c={parsed.hex}></span>
    <span class="s-out">[{parsed.rgb.join(", ")}] → {parsed.hex}</span>
  {/if}
</Section>

<Section
  title="colorFromSeed, hashString and initials"
  description="A stable hue from a user id (or a hashed name), spaced by the golden angle so neighbouring seeds look different; `Avatar` uses exactly this when there is no picture."
  code={`colorFromSeed(hashString("${name}")) // ${JSON.stringify(colorFromSeed(seed))}
initials("${name}")                   // ${JSON.stringify(initials(name))}`}
  block
>
  <div class="s-stack">
    <div class="s-row">
      <input class="field-input short" aria-label="Name" bind:value={name} />
      <span class="avatar" style:background={colorFromSeed(seed)}>{initials(name)}</span>
      <Avatar {name} size={32} />
      <span class="s-out muted">hashString = {seed}</span>
    </div>
    <div class="seeds">
      {#each Array.from({ length: 24 }, (_, i) => i) as i (i)}
        <span
          class="swatch swatch--round seed"
          style:--c={colorFromSeed(i)}
          use:tooltip={`colorFromSeed(${i}) = ${colorFromSeed(i)}`}
        ></span>
      {/each}
    </div>
  </div>
</Section>

<style>
  .fill {
    width: 100%;
  }
  .pick {
    gap: var(--gap-3);
  }
  input[type="color"] {
    width: calc(var(--swatch) + var(--sp-3));
    height: calc(var(--swatch) + var(--sp-3));
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .hex {
    width: 110px;
  }
  .wide {
    width: 220px;
  }
  .sample {
    display: flex;
    align-items: baseline;
    gap: var(--sp-4);
    padding: var(--sp-5);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .big {
    font-size: calc(var(--fs-xl) * 2);
    font-weight: 700;
  }
  .chip {
    padding: var(--gap-1) var(--sp-3);
    border-radius: var(--radius-pill);
    font-family: var(--mono);
    font-size: var(--fs-xs);
  }
  .danger {
    color: var(--danger);
  }
  .avatar {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius);
    color: var(--on-accent);
    font-size: var(--fs-sm);
    font-weight: 600;
  }
  .seeds {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-3);
  }
  .seed {
    width: var(--btn);
    height: var(--btn);
  }
  .short {
    width: 220px;
    max-width: 100%;
  }
</style>
