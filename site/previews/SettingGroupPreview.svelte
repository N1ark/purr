<script lang="ts">
  import { SettingGroup, SettingRow, Switch } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { props }: PreviewProps = $props();
  let notify = $state(true);
  let sound = $state(false);
</script>

<div class="stage">
  <SettingGroup {...props}>
    <SettingRow label="Notify me" sub="For direct messages and mentions.">
      <Switch label="Notify me" bind:checked={notify} />
    </SettingRow>
    <SettingRow label="Play a sound" disabled={!notify}>
      <Switch label="Play a sound" bind:checked={sound} disabled={!notify} />
    </SettingRow>
  </SettingGroup>
</div>

<style>
  .stage {
    width: 440px;
    max-width: 100%;
  }
</style>
