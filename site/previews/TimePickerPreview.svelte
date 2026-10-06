<script lang="ts">
  import { TimePicker } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();
  let value = $state<string | null>("09:30");
</script>

<TimePicker {value} step={Number(args.step)} noneLabel="No time" onpick={(t) => (value = t)} />
