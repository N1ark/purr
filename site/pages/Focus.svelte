<script lang="ts">
  import { Button, Switch, autofocus, focusTrap, focusables, rememberFocus, toast } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let trapped = $state(true);
  let region = $state<HTMLElement | null>(null);
  let count = $state(0);

  let renaming = $state(false);
  let name = $state("Design the schema");
  let draft = $state("");

  let busy = $state(false);

  function startRename() {
    draft = name;
    renaming = true;
  }

  async function borrowFocus(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
    const restore = rememberFocus();
    busy = true;
    e.currentTarget.blur();
    await new Promise((r) => setTimeout(r, 1200));
    busy = false;
    restore();
    toast("Focus went back to the button");
  }
</script>

<PageHeader
  title="focusTrap & autofocus"
  description="The focus plumbing behind every dialog: `focusTrap` keeps Tab inside a region, `autofocus` puts focus somewhere useful once a node is on screen, `rememberFocus` gives it back afterwards, and `focusables` lists what Tab can reach."
  importLine={`import { autofocus, focusTrap, focusables, rememberFocus } from "purr";`}
  source="src/actions/focus.ts"
/>

<Section
  title="focusTrap"
  description="Tab and Shift+Tab wrap around inside the region while it is on. Click a field below, then Tab past the last button."
  code={`<div use:focusTrap={trapped}>
  <input class="field-input" />
  <button class="btn">Cancel</button>
  <button class="btn btn--primary">Save</button>
</div>`}
>
  <div class="s-stack fill">
    <div class="s-row">
      <Switch label="Trap focus" bind:checked={trapped} />
      <span class="muted">Trap focus</span>
      <Button size="sm" onclick={() => (count = region ? focusables(region).length : 0)}>
        Count focusables
      </Button>
      <span class="s-out">focusables(region).length = {count}</span>
    </div>
    <div class="region s-box" class:on={trapped} bind:this={region} use:focusTrap={trapped}>
      <input class="field-input short" placeholder="First field" aria-label="First field" />
      <input class="field-input short" placeholder="Second field" aria-label="Second field" />
      <button type="button" class="btn" disabled>Disabled, skipped</button>
      <button type="button" class="btn">Cancel</button>
      <button type="button" class="btn btn--primary">Save</button>
    </div>
    <button type="button" class="btn btn--ghost outside">Outside the region</button>
  </div>
</Section>

<Section
  title="autofocus"
  description="Focuses the node on the next frame, without scrolling; `select: true` selects a field's text for a rename, `enabled: false` skips it (a phone, where focus raises the keyboard)."
  code={`{#if renaming}
  <input class="field-input" bind:value={draft} use:autofocus={{ select: true }} />
{/if}`}
>
  {#if renaming}
    <form
      class="s-row"
      onsubmit={(e) => {
        e.preventDefault();
        name = draft.trim() || name;
        renaming = false;
      }}
    >
      <input
        class="field-input rename"
        aria-label="Name"
        bind:value={draft}
        use:autofocus={{ select: true }}
      />
      <Button type="submit" variant="primary" size="sm">Rename</Button>
      <Button size="sm" onclick={() => (renaming = false)}>Cancel</Button>
    </form>
  {:else}
    <span class="name">{name}</span>
    <Button size="sm" onclick={startRename}>Rename…</Button>
  {/if}
</Section>

<Section
  title="rememberFocus"
  description="Call it before moving focus away; the function it returns puts focus back, unless something else has claimed it meanwhile."
  code={`const restore = rememberFocus();
await doSomethingThatStealsFocus();
restore();`}
>
  <Button loading={busy} onclick={borrowFocus}>Borrow focus for a second</Button>
  <span class="muted">Press it from the keyboard and watch the ring come back.</span>
</Section>

<style>
  .fill {
    width: 100%;
  }
  .region {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-4);
    border-style: dashed;
  }
  .region.on {
    border-color: var(--theme2);
  }
  .outside {
    align-self: flex-start;
  }
  .rename {
    width: 240px;
  }
  .name {
    font-weight: 600;
    color: var(--color2);
  }
  .short {
    width: 220px;
    max-width: 100%;
  }
</style>
