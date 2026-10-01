<script lang="ts">
  import { Button, Sheet } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();
  let open = $state(false);

  function close() {
    on.onclose();
    open = false;
  }
</script>

<Button variant="primary" onclick={() => (open = true)}>Open the sheet</Button>

{#if open}
  <Sheet
    {...props}
    label={String(args.label)}
    bind:full={() => Boolean(args.full), (full: boolean) => on.onfull(full)}
    onclose={close}
  >
    <div class="body">
      <p>Drag the grabber or the contents; flick it to the next stop or off the bottom.</p>
      <p class="muted">{args.full ? "Full" : "Peeking"}</p>
      <input class="field-input" placeholder="Focusing a field opens it fully" />
    </div>
  </Sheet>
{/if}

<style>
  .body {
    padding: var(--sp-4) var(--sp-5);
    overflow-y: auto;
  }
  .body .field-input {
    width: 100%;
  }
</style>
