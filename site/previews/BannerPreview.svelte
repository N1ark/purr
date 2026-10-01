<script lang="ts">
  import { Banner, Button, toast } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();
  let shown = $state(true);

  function dismiss() {
    on.ondismiss();
    shown = false;
  }
</script>

{#snippet restart()}
  <Button variant="primary" size="sm" onclick={() => toast("Restarting…")}>Restart</Button>
{/snippet}

{#snippet banner()}
  <Banner
    {...props}
    title={String(args.title)}
    actions={args.actions ? restart : undefined}
    ondismiss={props.ondismiss ? dismiss : undefined}
  />
{/snippet}

{#if !shown}
  <Button onclick={() => (shown = true)}>Show it again</Button>
{:else if args.placement === "corner"}
  {@render banner()}
  <p class="muted">In the bottom corner of the window, over everything but toasts.</p>
{:else}
  <div class="stage">{@render banner()}</div>
{/if}

<style>
  .stage {
    width: 420px;
    max-width: 100%;
  }
  p {
    margin: 0;
  }
</style>
