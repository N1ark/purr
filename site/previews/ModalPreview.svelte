<script lang="ts">
  import { Button, Modal } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();
  let open = $state(false);

  function close() {
    on.onclose();
    open = false;
  }
</script>

{#snippet footer()}
  <Button onclick={close}>Cancel</Button>
  <Button variant="primary" onclick={close}>Save</Button>
{/snippet}

<Button variant="primary" onclick={() => (open = true)}>Open the modal</Button>

{#if open}
  <Modal
    {...props}
    label={String(args.label)}
    onclose={close}
    footer={args.footer ? footer : undefined}
  >
    <p>{args.children}</p>
    {#if args.field}<input class="field-input" placeholder="Focused on open" />{/if}
  </Modal>
{/if}
