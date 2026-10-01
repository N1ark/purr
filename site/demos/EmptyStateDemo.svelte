<script lang="ts">
  import { Button, EmptyState, toast } from "purr";
  import { FolderOpen } from "purr/icons";
</script>

<div class="s-box">
  <EmptyState icon={FolderOpen} text="No folder open" hint="Notes live in a folder on disk.">
    {#snippet action()}
      <Button size="sm" variant="primary" onclick={() => toast("Open a folder…")}
        >Open a folder…</Button
      >
    {/snippet}
  </EmptyState>
</div>
