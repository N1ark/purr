<script lang="ts">
  import { Segmented, SettingRow, Switch } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, props }: PreviewProps = $props();
  let on = $state(true);
  let layout = $state<"list" | "grid">("list");
</script>

<div class="stage">
  <SettingRow {...props} label={String(args.label)}>
    {#if args.control === "segmented"}
      <Segmented
        label="Layout"
        bind:value={layout}
        options={[
          { id: "list", label: "List" },
          { id: "grid", label: "Grid" },
        ]}
      />
    {:else if args.control === "select"}
      <select class="field-input" aria-label={String(args.label)}>
        <option>Everyone</option>
        <option>Only me</option>
      </select>
    {:else}
      <Switch label={String(args.label)} bind:checked={on} disabled={Boolean(args.disabled)} />
    {/if}
  </SettingRow>
</div>

<style>
  .stage {
    width: 420px;
    max-width: 100%;
  }
</style>
