<script lang="ts">
  import { IconButton, Segmented, tooltip, type TooltipSource } from "purr";
  import { Copy, Gear, Trash } from "purr/icons";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let text = $state("Undo");
  let hint = $state("⌘Z");
  let placement = $state<"top" | "bottom">("top");
  let enabled = $state(true);

  const source = $derived<TooltipSource>(
    enabled ? { text, hint: hint || undefined, placement } : false,
  );

  const live = $derived.by(() => {
    const fields = [`text: ${JSON.stringify(text)}`];
    if (hint) fields.push(`hint: ${JSON.stringify(hint)}`);
    if (placement !== "top") fields.push(`placement: "${placement}"`);
    const arg = !enabled
      ? "false"
      : fields.length === 1
        ? JSON.stringify(text)
        : `{ ${fields.join(", ")} }`;
    return `<button class="btn" use:tooltip={${arg}}>Edit</button>`;
  });

  let hovers = $state(0);
</script>

<PageHeader
  title="tooltip"
  description="`use:tooltip` shows an instant tooltip on hover and on keyboard focus, unlike `title`, which waits a second. One shared bubble on `<body>`, placed above the target or below it when there is no room. Nothing on a phone: there is no hover."
  importLine={`import { tooltip } from "purr";`}
  source="src/actions/tooltip.ts"
/>

<Section
  title="Try it"
  description="Text, an optional shortcut hint (written in purr's glyph form, shown the platform's way) and a preferred side. `false`, `null` or an empty string turns it off."
  code={live}
>
  <div class="s-stack fill">
    <div class="s-row">
      <input class="field-input short" aria-label="Text" placeholder="Text" bind:value={text} />
      <input
        class="field-input hint"
        aria-label="Hint"
        placeholder="Hint, e.g. ⌘Z"
        bind:value={hint}
      />
      <Segmented
        label="Placement"
        size="sm"
        options={[
          { id: "top", label: "top" },
          { id: "bottom", label: "bottom" },
        ]}
        bind:value={placement}
      />
      <label class="s-row check"
        ><input type="checkbox" class="checkbox" bind:checked={enabled} /> enabled</label
      >
    </div>
    <div class="target"><button type="button" class="btn" use:tooltip={source}>Edit</button></div>
  </div>
</Section>

<Section
  title="Kinds of content"
  description="A string; text with a hint; sanitised HTML; or a function, evaluated on each hover (only when a label overflows, say)."
  code={`<button class="btn" use:tooltip={"Instant, unlike title"}>Text</button>
<button class="btn" use:tooltip={{ text: "Undo", hint: "⌘Z" }}>With a shortcut</button>
<button class="btn" use:tooltip={{ html: "<b>Bold</b> and <code>code</code>" }}>HTML</button>
<button class="btn" use:tooltip={() => \`Asked at \${new Date().toLocaleTimeString()}\`}>
  Evaluated per hover
</button>`}
>
  <button type="button" class="btn" use:tooltip={"Instant, unlike title"}>Text</button>
  <button type="button" class="btn" use:tooltip={{ text: "Undo", hint: "⌘Z" }}
    >With a shortcut</button
  >
  <button type="button" class="btn" use:tooltip={{ html: "<b>Bold</b> and <code>code</code>" }}
    >HTML</button
  >
  <button
    type="button"
    class="btn"
    use:tooltip={() => `Asked at ${new Date().toLocaleTimeString()} (hover ${++hovers})`}
    >Evaluated per hover</button
  >
  <button type="button" class="btn" title="The browser's own, a second late">title=""</button>
</Section>

<Section
  title="On icon buttons"
  description={"`IconButton` wires its `label` (and `shortcut`) into the tooltip by itself; `tip` overrides it, `tip={false}` drops it."}
  code={`<IconButton label="Copy"><Copy /></IconButton>
<IconButton label="Settings" shortcut="⌘,"><Gear /></IconButton>
<IconButton label="Delete" tip={{ text: "Delete", hint: "⌫" }} danger><Trash /></IconButton>`}
>
  <IconButton label="Copy"><Copy /></IconButton>
  <IconButton label="Settings" shortcut="⌘,"><Gear /></IconButton>
  <IconButton label="Delete" tip={{ text: "Delete", hint: "⌫" }} danger><Trash /></IconButton>
</Section>

<style>
  .fill {
    width: 100%;
  }
  .hint {
    width: 120px;
  }
  .check {
    gap: var(--gap-3);
    font-size: var(--fs-sm);
  }
  .target {
    display: grid;
    place-items: center;
    min-height: 96px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
  }
  .short {
    width: 220px;
    max-width: 100%;
  }
</style>
