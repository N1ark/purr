import { ToastHost } from "purr";
import ToastHostPreview from "../previews/ToastHostPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ToastHost",
  group: "Overlays & menus",
  component: ToastHost,
  description:
    "Mount once; it shows `toast()`, `toast.success()` and `toast.error()`, four at most. These controls change this site's host.",
  keywords: ["toast", "notification", "snackbar"],
  controls: {
    position: { type: "select", options: ["bottom", "bottom-end"], default: "bottom" },
    dismissLabel: { type: "text", default: "Dismiss" },
  },
  inner: () => "",
  code: (args) => `<script lang="ts">
  import { ToastHost, toast } from "purr";
</script>

<!-- once, at the root -->
<ToastHost${args.position !== "bottom" ? ` position="${args.position}"` : ""}${args.dismissLabel !== "Dismiss" ? ` dismissLabel="${args.dismissLabel}"` : ""} />

<!-- anywhere -->
<Button onclick={() => toast("Copied path")}>Copy</Button>`,
  preview: ToastHostPreview,
});
