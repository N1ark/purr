<script lang="ts">
  import { ActionSheet, Button } from "purr";
  import { ArrowBendUpLeft, Copy, PushPin, Star, Trash } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();
  let open = $state(false);
  let sheet = $state<ActionSheet | null>(null);

  const ITEMS = [
    { label: "Reply", icon: ArrowBendUpLeft },
    { label: "Copy text", icon: Copy },
    { label: "Pin", icon: PushPin },
    { label: "Star", icon: Star },
  ];

  function close() {
    on.onclose();
    open = false;
  }

  function run(label: string) {
    on["item.run"](label);
    sheet?.dismiss();
  }
</script>

<Button variant="primary" onclick={() => (open = true)}>Open the sheet</Button>

{#if open}
  <ActionSheet bind:this={sheet} {...props} label={String(args.label)} onclose={close}>
    <div class="items" role="none">
      {#each ITEMS as item (item.label)}
        <button type="button" class="row-item" role="menuitem" onclick={() => run(item.label)}>
          <item.icon />
          {item.label}
        </button>
      {/each}
      <button type="button" class="row-item danger" role="menuitem" onclick={() => run("Delete")}>
        <Trash /> Delete
      </button>
    </div>
  </ActionSheet>
{/if}

<style>
  .items {
    display: flex;
    flex-direction: column;
    padding: var(--sp-2);
  }
  .danger {
    color: var(--danger);
  }
</style>
