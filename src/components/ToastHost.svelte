<script lang="ts">
  // Mount once: shows what `toast(...)` says, newest last, above everything but tooltips.
  import CheckCircleIcon from "phosphor-svelte/lib/CheckCircleIcon";
  import WarningCircleIcon from "phosphor-svelte/lib/WarningCircleIcon";
  import XIcon from "phosphor-svelte/lib/XIcon";

  import { toasts } from "../lib/toast.svelte";
  import IconButton from "./IconButton.svelte";

  interface Props {
    /** Centred along the bottom, or in the bottom corner. */
    position?: "bottom" | "bottom-end";
    dismissLabel?: string;
  }

  const { position = "bottom", dismissLabel = "Dismiss" }: Props = $props();
</script>

<div class="toasts {position}" aria-live="polite">
  {#each toasts.list as t (t.id)}
    <div class="toast surface {t.kind}" role={t.kind === "error" ? "alert" : "status"}>
      {#if t.kind === "error"}
        <span class="icon"><WarningCircleIcon weight="fill" /></span>
      {:else if t.kind === "success"}
        <span class="icon"><CheckCircleIcon weight="fill" /></span>
      {/if}
      <span class="text">{t.text}</span>
      {#if t.action}
        {@const action = t.action}
        <button
          type="button"
          class="btn btn--sm btn--ghost"
          onclick={() => {
            toasts.dismiss(t.id);
            action.run();
          }}>{action.label}</button
        >
      {/if}
      <IconButton label={dismissLabel} size="sm" tip={false} onclick={() => toasts.dismiss(t.id)}>
        <XIcon />
      </IconButton>
    </div>
  {/each}
</div>

<style>
  .toasts {
    position: fixed;
    bottom: calc(var(--sp-5) + var(--safe-bottom) + var(--kb));
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-4);
    max-width: min(480px, calc(100vw - 32px));
    pointer-events: none;
  }
  .toasts.bottom {
    left: 50%;
    transform: translateX(-50%);
  }
  .toasts.bottom-end {
    right: var(--sp-5);
    align-items: flex-end;
  }
  /* Above the phone's floating bottom bar. */
  :global(body.mobile) .toasts {
    bottom: calc(var(--safe-bottom) + var(--kb) + var(--btn) + var(--sp-5) * 2);
  }
  .toast {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    max-width: 100%;
    padding: var(--sp-2) var(--sp-2) var(--sp-2) var(--sp-4);
    /* Washed in its tone, as a callout is; tuned with `--toast-tint`. */
    --toast-c: var(--theme);
    background: color-mix(in oklab, var(--toast-c) var(--toast-tint, 9%), var(--surface));
    border-color: color-mix(in oklab, var(--toast-c) 30%, var(--border));
    box-shadow: var(--shadow-lg);
    font-size: var(--fs-sm);
    color: var(--color2);
    pointer-events: auto;
    animation: toast-in var(--dur-slow) var(--ease-sheet);
  }
  .toast.error {
    --toast-c: var(--danger);
  }
  .toast.success {
    --toast-c: var(--success);
  }
  .icon {
    display: inline-flex;
    flex: none;
    margin-left: calc(var(--gap-2) * -1);
    font-size: var(--icon-md);
    color: var(--toast-c);
  }
  .text {
    flex: 1;
    min-width: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
</style>
