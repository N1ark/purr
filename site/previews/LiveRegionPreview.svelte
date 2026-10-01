<script lang="ts">
  import { Button, LiveRegion } from "purr";
  import { Megaphone } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();
  let said = $state({ text: "", seq: 0 });
</script>

<div class="s-stack">
  <Button onclick={() => (said = { text: String(args.text ?? ""), seq: said.seq + 1 })}>
    <Megaphone /> Announce
  </Button>
  <p class="muted">
    {#if said.seq}A screen reader now says “{said.text}” (seq {said.seq}).{:else}Nothing is drawn:
      the region is <code>.sr-only</code>.{/if}
  </p>
  <LiveRegion text={said.text} seq={said.seq} assertive={Boolean(args.assertive)} />
</div>

<style>
  p {
    margin: 0;
    font-size: var(--fs-sm);
  }
</style>
