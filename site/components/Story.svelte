<script lang="ts">
  // Any story's page: the live preview driven by the controls, the events it fired, the code it
  // stands for, then the fixed examples.
  import { Button, EmptyState, IconButton, Segmented, formatClock } from "purr";
  import { ArrowCounterClockwise, Lightning, Trash } from "purr/icons";
  import { storyCode } from "../lib/code";
  import { describeCall } from "../lib/format";
  import { propsOf } from "../lib/props";
  import { eventSpecs, initialArgs, type Args, type Example, type Story } from "../lib/story";
  import CodeSnippet from "./CodeSnippet.svelte";
  import Controls from "./Controls.svelte";
  import PageHeader from "./PageHeader.svelte";
  import Rendered from "./Rendered.svelte";

  interface Props {
    story: Story;
  }

  const { story }: Props = $props();

  // A story never changes under a mounted page: `App` keys the page on its slug.
  // svelte-ignore state_referenced_locally
  const name = story.name ?? story.title;
  // svelte-ignore state_referenced_locally
  let args = $state<Args>(initialArgs(story));
  let open = $state(false);
  let zoom = $state<"1×" | "2×">("1×");
  let log = $state<{ id: number; name: string; detail: string; at: number }[]>([]);
  let seq = 0;

  const specs = $derived(eventSpecs(story));

  function record(event: string, params: unknown[]) {
    log = [{ id: ++seq, name: event, detail: describeCall(params), at: Date.now() }, ...log].slice(
      0,
      40,
    );
  }

  /** Every declared callback, logged; `live` ones also sync the controls and close overlays. */
  function handlers(live: boolean): Record<string, (...params: any[]) => void> {
    const out: Record<string, (...params: any[]) => void> = {};
    for (const [event, spec] of specs) {
      out[event] = (...params: unknown[]) => {
        record(event, params);
        if (!live) return;
        const patch = spec.sync?.(args, ...params);
        if (patch) Object.assign(args, patch);
        if (story.overlay?.close === event) open = false;
      };
    }
    return out;
  }

  const on = handlers(true);
  const quiet = handlers(false);

  const liveProps = $derived(propsOf(story, args, on));
  const code = $derived(storyCode(story, args));

  const set = (patch: Args) => Object.assign(args, patch);
  const reset = () => Object.assign(args, initialArgs(story));
  const exampleArgs = (example: Example) => ({ ...initialArgs(story), ...example.args });

  function tryExample(example: Example) {
    Object.assign(args, exampleArgs(example));
    document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

<PageHeader
  title={story.title}
  description={story.description}
  importLine={`import { ${name} } from "purr";`}
  source={story.source ?? `src/components/${name}.svelte`}
/>

<section class="playground" id="playground" aria-label="Playground">
  <div class="canvas">
    {#if story.preview}
      <story.preview {args} props={liveProps} {on} {set} />
    {:else if story.overlay}
      <Button variant="primary" onclick={() => (open = true)}>
        {story.overlay.open ?? `Open ${story.title}`}
      </Button>
      {#if open}
        <Rendered {story} values={args} calls={on} />
      {/if}
    {:else}
      <div class="zoomed" style:zoom={zoom === "2×" ? 2 : undefined}>
        <Rendered {story} values={args} calls={on} />
      </div>
      <div class="zoom">
        <Segmented
          label="Zoom"
          size="sm"
          options={[
            { id: "1×", label: "1×" },
            { id: "2×", label: "2×" },
          ]}
          bind:value={zoom}
        />
      </div>
    {/if}
  </div>
  {#if story.controls || specs.some(([, s]) => s.optional)}
    <div class="panel">
      <div class="panel-head">
        <h2>Props</h2>
        <Button variant="ghost" size="sm" onclick={reset}>
          <ArrowCounterClockwise /> Reset
        </Button>
      </div>
      <Controls {story} bind:args />
    </div>
  {/if}
</section>

<div class="below" class:single={!specs.length}>
  <section aria-label="Code">
    <h2>Code</h2>
    <CodeSnippet {code} />
  </section>

  {#if specs.length}
    <section class="events" aria-label="Events">
      <div class="panel-head">
        <h2>Events</h2>
        {#if log.length}
          <IconButton label="Clear the log" size="sm" onclick={() => (log = [])}
            ><Trash /></IconButton
          >
        {/if}
      </div>
      <ol class="log surface" aria-live="polite">
        {#each log as entry (entry.id)}
          <li>
            <span class="faint tabular">{formatClock(entry.at)}</span>
            <span class="mono event">{entry.name}</span>
            <span class="mono muted detail">({entry.detail})</span>
          </li>
        {:else}
          <li class="none">
            <EmptyState
              inline
              icon={Lightning}
              text="Nothing yet"
              hint={`Calls to ${specs.map(([e]) => e).join(", ")} show up here.`}
            />
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</div>

{#if story.examples?.length}
  <section aria-label="Examples">
    <h2>Examples</h2>
    <div class="examples">
      {#each story.examples as example (example.title)}
        <figure class="example">
          <div class="example-canvas">
            {#if story.preview}
              {@const values = exampleArgs(example)}
              <story.preview
                args={values}
                props={propsOf(story, values, quiet)}
                on={quiet}
                set={() => {}}
              />
            {:else}
              <Rendered {story} values={exampleArgs(example)} calls={quiet} />
            {/if}
          </div>
          <figcaption>
            <span>{example.title}</span>
            <Button variant="link" size="sm" onclick={() => tryExample(example)}>Try</Button>
          </figcaption>
        </figure>
      {/each}
    </div>
  </section>
{/if}

{#if story.demo}
  <section aria-label="More examples">
    <h2>{story.examples?.length ? "More" : "Examples"}</h2>
    <div class="demo"><story.demo /></div>
  </section>
{/if}

<style>
  h2 {
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--color2);
  }
  section {
    margin-bottom: calc(var(--sp-5) * 2);
  }
  .playground {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    scroll-margin-top: var(--sp-5);
  }
  .canvas {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--gap-4);
    min-width: 0;
    min-height: 220px;
    padding: calc(var(--sp-5) * 2);
    background: var(--bg);
    --ring-bg: var(--bg);
  }
  .zoomed {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--gap-4);
    max-width: 100%;
  }
  .zoom {
    position: absolute;
    top: var(--sp-3);
    left: var(--sp-3);
  }
  .panel {
    min-width: 0;
    padding: var(--sp-5);
    border-left: 1px solid var(--border);
    background: var(--bg2);
  }
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-4);
    margin-bottom: var(--sp-4);
  }
  .panel-head h2 {
    margin: 0;
  }
  .below {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: calc(var(--sp-5) * 2);
    margin-top: calc(var(--sp-5) * 2);
  }
  .below.single {
    grid-template-columns: minmax(0, 1fr);
  }
  .below > section {
    margin-bottom: calc(var(--sp-5) * 2);
  }
  .log {
    display: flex;
    flex-direction: column;
    max-height: 220px;
    margin: 0;
    padding: var(--sp-2) 0;
    overflow-y: auto;
    list-style: none;
    box-shadow: none;
  }
  .log li {
    display: flex;
    align-items: baseline;
    gap: var(--gap-4);
    min-width: 0;
    padding: var(--gap-1) var(--sp-4);
    font-size: var(--fs-sm);
  }
  .log li.none {
    justify-content: center;
  }
  .event {
    color: var(--theme2);
  }
  .detail {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .examples {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--sp-5);
  }
  .example {
    display: flex;
    flex-direction: column;
    margin: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .example-canvas {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--gap-4);
    min-height: 96px;
    padding: var(--sp-5);
    --ring-bg: var(--bg);
  }
  figcaption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-4);
    padding: var(--sp-2) var(--sp-4);
    border-top: 1px solid var(--border);
    background: var(--bg2);
    font-size: var(--fs-sm);
    color: var(--muted);
  }
  @media (max-width: 900px) {
    .playground,
    .below {
      grid-template-columns: minmax(0, 1fr);
    }
    .panel {
      border-left: none;
      border-top: 1px solid var(--border);
    }
    .canvas {
      min-height: 160px;
      padding: var(--sp-5);
    }
  }
</style>
