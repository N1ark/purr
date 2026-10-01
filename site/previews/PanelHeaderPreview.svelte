<script lang="ts">
  import { IconButton, PanelHeader, toast } from "purr";
  import { ArrowsClockwise } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args, props }: PreviewProps = $props();
</script>

{#snippet refresh()}
  <IconButton label="Refresh" onclick={() => toast("Refreshed")}><ArrowsClockwise /></IconButton>
{/snippet}

<div class="pane surface">
  <PanelHeader {...props} title={String(args.title)} actions={args.actions ? refresh : undefined} />
  <div class="body muted">The pane's contents</div>
</div>

<style>
  .pane {
    width: 380px;
    max-width: 100%;
    overflow: hidden;
  }
  .body {
    display: grid;
    place-items: center;
    height: 96px;
    font-size: var(--fs-sm);
  }
</style>
