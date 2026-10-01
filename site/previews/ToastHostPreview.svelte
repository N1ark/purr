<script lang="ts">
  import { Button, toast } from "purr";
  import { hosts } from "../lib/site.svelte";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();

  $effect(() => {
    hosts.toast.position = args.position === "bottom-end" ? "bottom-end" : "bottom";
    hosts.toast.dismissLabel = String(args.dismissLabel || "Dismiss");
  });
  $effect(() => () => {
    hosts.toast.position = "bottom";
    hosts.toast.dismissLabel = "Dismiss";
  });
</script>

<Button onclick={() => toast("Copied path")}>Info</Button>
<Button onclick={() => toast.success("Pushed to origin")}>Success</Button>
<Button onclick={() => toast.error(new Error("Couldn't access the clipboard"))}>Error</Button>
<Button
  onclick={() => toast("Undid: move", { action: { label: "Redo", run: () => toast("Redid") } })}
>
  With an action
</Button>
<Button onclick={() => toast("Stays until dismissed", { timeout: 0 })}>Sticky</Button>
