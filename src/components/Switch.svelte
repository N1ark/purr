<script lang="ts">
  // An on/off switch. The visible label is usually the row's, so `label` names it for readers.
  interface Props {
    checked: boolean;
    label: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let { checked = $bindable(), label, disabled = false, onchange }: Props = $props();

  // With `onchange` the caller owns the state, so a save that fails leaves the switch where it was.
  function toggle() {
    if (onchange) onchange(!checked);
    else checked = !checked;
  }
</script>

<button
  type="button"
  class="switch"
  class:is-on={checked}
  role="switch"
  aria-label={label}
  aria-checked={checked}
  {disabled}
  onclick={toggle}
>
  <span class="knob"></span>
</button>

<style>
  .switch {
    position: relative;
    flex: none;
    width: 32px;
    height: 18px;
    border: 1px solid var(--control-border);
    border-radius: var(--radius-pill);
    background: var(--bg3);
    transition:
      background-color var(--dur),
      border-color var(--dur);
  }
  .switch.is-on {
    border-color: var(--theme);
    background: var(--theme);
  }
  .switch:disabled {
    opacity: 0.5;
  }
  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--muted);
    transition:
      transform var(--dur) var(--ease),
      background-color var(--dur);
  }
  .is-on .knob {
    transform: translateX(14px);
    background: var(--on-accent);
  }
  @media (hover: hover) {
    .switch:hover:not(:disabled, .is-on) {
      border-color: var(--border-strong);
    }
  }
</style>
