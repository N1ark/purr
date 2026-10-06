<script lang="ts">
  import { DatePicker, dayKey, formatDate } from "purr";
  import type { PreviewProps } from "../lib/story";

  const {}: PreviewProps = $props();

  let value = $state<string | null>(dayKey(Date.now()));
</script>

<div class="frame">
  <DatePicker {value} onpick={(d) => (value = d)} />
  <p>{value ? formatDate(value, { style: "long" }) : "No day"}</p>
</div>

<style>
  .frame {
    display: flex;
    flex-direction: column;
    gap: var(--gap-3);
  }
  p {
    margin: 0;
    font-size: var(--fs-xs);
    color: var(--muted);
  }
</style>
