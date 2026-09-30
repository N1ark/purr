<script lang="ts">
  // A standing notice the person acts on in their own time — an update is ready, the connection
  // dropped — rather than a dialog in their way. Floats in a corner, or sits inline in a layout.
  import type { Component, Snippet } from "svelte";
  import XIcon from "phosphor-svelte/lib/XIcon";

  import IconButton from "./IconButton.svelte";

  interface Props {
    title: string;
    /** A few muted lines under it: the release notes' first points. */
    lines?: readonly string[];
    icon?: Component<any>;
    tone?: "info" | "warn" | "danger" | "success";
    /** Floating in the bottom corner (the default), or in the flow of the page. */
    placement?: "corner" | "inline";
    /** The buttons: "Restart". */
    actions?: Snippet;
    /** Shows a close button; "not now". */
    ondismiss?: () => void;
    dismissLabel?: string;
    children?: Snippet;
  }

  const {
    title,
    lines = [],
    icon: Icon,
    tone = "info",
    placement = "corner",
    actions,
    ondismiss,
    dismissLabel = "Dismiss",
    children,
  }: Props = $props();
</script>

<div class="banner surface {tone} {placement}" role={tone === "danger" ? "alert" : "status"}>
  {#if Icon}<span class="icon"><Icon /></span>{/if}
  <div class="what">
    <span class="title">{title}</span>
    {#each lines as line, i (i)}
      <span class="line">{line}</span>
    {/each}
    {@render children?.()}
  </div>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
  {#if ondismiss}
    <IconButton label={dismissLabel} size="sm" tip={false} onclick={ondismiss}><XIcon /></IconButton
    >
  {/if}
</div>

<style>
  .banner {
    display: flex;
    align-items: flex-start;
    gap: var(--gap-4);
    padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-4);
    color: var(--color);
    --tone: var(--info);
  }
  .banner.corner {
    position: fixed;
    right: calc(var(--sp-5) + var(--safe-right));
    bottom: calc(var(--sp-5) + var(--safe-bottom));
    z-index: var(--z-banner);
    max-width: min(420px, calc(100vw - 32px));
    box-shadow: var(--shadow-lg);
    animation: banner-in var(--dur-slow) var(--ease);
  }
  .banner.warn {
    --tone: var(--warn);
  }
  .banner.danger {
    --tone: var(--danger);
  }
  .banner.success {
    --tone: var(--success);
  }
  .icon {
    display: grid;
    flex: none;
    padding-top: 1px;
    font-size: var(--icon-lg);
    color: var(--tone);
  }
  .what {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: var(--fs-sm);
    color: var(--color2);
  }
  .line {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--fs-xs);
    color: var(--muted);
  }
  .actions {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    flex: none;
  }
  @keyframes banner-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
</style>
