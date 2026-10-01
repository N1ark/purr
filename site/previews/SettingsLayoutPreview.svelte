<script lang="ts">
  import {
    PanelHeader,
    SettingGroup,
    SettingRow,
    SettingsLayout,
    Switch,
    type SettingsGroup,
  } from "purr";
  import { Gear, GitBranch, Keyboard } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args, props }: PreviewProps = $props();

  const GROUPS: SettingsGroup[] = [
    {
      label: "General",
      sections: [
        { id: "appearance", label: "Appearance", icon: Gear },
        { id: "git", label: "Git", icon: GitBranch },
      ],
    },
    { label: "Keyboard", sections: [{ id: "shortcuts", label: "Shortcuts", icon: Keyboard }] },
  ];
  const TITLES: Record<string, string> = {
    appearance: "Appearance",
    git: "Git",
    shortcuts: "Shortcuts",
  };
  let compact = $state(false);
</script>

<div class="window surface">
  <SettingsLayout {...props} groups={GROUPS} current={String(args.current)}>
    {#snippet header()}
      <PanelHeader title={TITLES[String(args.current)]} />
    {/snippet}
    <SettingGroup title={TITLES[String(args.current)]}>
      <SettingRow label="Compact rows" sub="Fits more on screen.">
        <Switch label="Compact rows" bind:checked={compact} />
      </SettingRow>
    </SettingGroup>
  </SettingsLayout>
</div>

<style>
  .window {
    display: flex;
    flex-direction: column;
    width: 600px;
    max-width: 100%;
    height: 320px;
    overflow: hidden;
  }
</style>
