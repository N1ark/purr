<script lang="ts">
  import { Button } from "purr";
  import { PushPin } from "purr/icons";

  let loading = $state(false);
  let pinned = $state(true);

  function save() {
    loading = true;
    setTimeout(() => (loading = false), 1500);
  }
</script>

<div class="s-row">
  <Button variant="primary" {loading} onclick={save}>{loading ? "Saving…" : "Save"}</Button>
  <Button pressed={pinned} onclick={() => (pinned = !pinned)}>
    <PushPin weight={pinned ? "fill" : "regular"} /> Pinned
  </Button>
  <Button variant="primary">Send <kbd>⌘↩</kbd></Button>
  <button type="button" class="btn btn--ghost">Class only: <kbd>⌘K</kbd></button>
</div>
