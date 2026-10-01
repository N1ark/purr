<script lang="ts">
  import { Tag, toast } from "purr";
  import { TAGS } from "../lib/samples";

  let tags = $state(["design", "urgent", "later", "blocked", "docs"]);
</script>

<div class="s-row">
  {#each tags as tag, i (tag)}
    <Tag
      label={tag}
      color={TAGS[(i * 2) % TAGS.length]}
      onclick={() => toast(`Filter by ${tag}`)}
      onremove={() => (tags = tags.filter((t) => t !== tag))}
    />
  {/each}
  <span class="tag" style:--tag="var(--success)">class only</span>
</div>
