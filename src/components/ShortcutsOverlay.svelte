<script lang="ts">
  // The `?` overlay: every shortcut, from the same table the key handler reads.
  import type { HelpGroup } from "../lib/keys";
  import Modal from "./Modal.svelte";
  import ShortcutList from "./ShortcutList.svelte";

  interface Props {
    groups: readonly HelpGroup[];
    onclose: () => void;
    title?: string;
    or?: string;
    then?: string;
    closeLabel?: string;
  }

  const { groups, onclose, title = "Keyboard shortcuts", or, then, closeLabel }: Props = $props();
</script>

<Modal
  label={title}
  {title}
  {onclose}
  {closeLabel}
  scrim="frosted"
  width="min(600px, calc(100vw - 32px))"
  height="min(600px, calc(100vh - 64px))"
>
  <div class="scroll">
    <ShortcutList {groups} {or} {then} />
  </div>
</Modal>

<style>
  .scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--sp-4) var(--sp-5) var(--sp-5);
  }
</style>
