<script lang="ts">
  import { IconButton, SearchInput } from "purr";
  import { Funnel } from "purr/icons";

  let query = $state("");
  let unread = $state(true);
</script>

<div class="panel surface">
  <SearchInput label="Filter channels" placeholder="Filter channels" bind:value={query} clearable>
    {#snippet trailing()}
      <IconButton label="Only unread" size="sm" pressed={unread} onclick={() => (unread = !unread)}>
        <Funnel />
      </IconButton>
    {/snippet}
  </SearchInput>
</div>

<style>
  .panel {
    width: 360px;
    max-width: 100%;
    box-shadow: none;
  }
</style>
