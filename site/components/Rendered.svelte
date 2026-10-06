<script lang="ts">
  // A story's component with the given control values: its page's preview, examples and thumbnail.
  import { childrenOf, propsOf, type Calls } from "../lib/props";
  import type { Args, Story } from "../lib/story";

  interface Props {
    story: Story;
    values: Args;
    calls: Calls;
  }

  const { story, values, calls }: Props = $props();

  const p = $derived(propsOf(story, values, calls));
  const kids = $derived(childrenOf(story, values));
</script>

{#if story.component}
  <div class="stage" class:sized={!!story.width} style:width={story.width}>
    {#if story.children}
      <story.component {...p}>
        {#if story.children.tag === "p"}
          <p>{kids.text}</p>
        {:else}
          {#if kids.Icon}<kids.Icon />{/if}
          {kids.text}
        {/if}
      </story.component>
    {:else}
      <story.component {...p} />
    {/if}
  </div>
{/if}

<style>
  .stage {
    display: contents;
  }
  .stage.sized {
    display: block;
    max-width: 100%;
  }
</style>
