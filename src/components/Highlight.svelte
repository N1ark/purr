<script lang="ts">
  // Text with the characters a fuzzy match hit marked, from `fuzzyMatch(...).indices`.
  import { highlightRuns } from "../lib/fuzzy";

  interface Props {
    text: string;
    indices: readonly number[];
  }

  const { text, indices }: Props = $props();

  const runs = $derived(highlightRuns(text, indices));
</script>

{#each runs as run, i (i)}{#if run.hit}<mark>{run.text}</mark>{:else}{run.text}{/if}{/each}

<style>
  mark {
    background: none;
    color: var(--theme2);
    font-weight: 600;
  }
</style>
