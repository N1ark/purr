<script lang="ts">
  // A page's picture on the home page: its component at rest, shrunk to fit, or a drawn stand-in.
  import type { Page } from "../pages";
  import { initialArgs } from "../lib/story";
  import { propsOf } from "../lib/props";
  import Rendered from "./Rendered.svelte";
  import Sketch, { SKETCHED } from "./Sketch.svelte";

  interface Props {
    page: Page;
  }

  const { page }: Props = $props();

  const story = $derived(page.story);
  const live = $derived(
    !!story && story.thumb !== false && !story.overlay && !SKETCHED.has(page.slug),
  );
  const values = $derived(story ? { ...initialArgs(story), ...(story.thumb || {}) } : {});
  const none = {};

  /** Scales the content to fit the frame: down as far as it takes, up a little at most. */
  function fit(node: HTMLElement) {
    const frame = node.parentElement!;
    const pad = parseFloat(getComputedStyle(frame).paddingLeft) * 2;
    const measure = () => {
      const s = Math.min(
        1.25,
        (frame.clientWidth - pad) / Math.max(node.scrollWidth, 1),
        (frame.clientHeight - pad) / Math.max(node.scrollHeight, 1),
      );
      node.style.scale = String(s);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }
</script>

<div class="frame" inert aria-hidden="true">
  {#if live && story}
    <div class="fit" class:wide={story.width?.endsWith("%")} use:fit>
      {#if story.preview}
        <story.preview
          args={values}
          props={propsOf(story, values, none)}
          on={none}
          set={() => {}}
        />
      {:else}
        <Rendered {story} {values} calls={none} />
      {/if}
    </div>
  {:else}
    <Sketch slug={page.slug} />
  {/if}
</div>

<style>
  .frame {
    position: relative;
    display: grid;
    place-items: center;
    height: 100px;
    padding: var(--sp-4);
    overflow: hidden;
    pointer-events: none;
    --ring-bg: var(--bg);
  }
  .fit {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    width: max-content;
    max-width: 420px;
  }
  .fit.wide {
    width: 420px;
  }
</style>
