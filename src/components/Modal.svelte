<script lang="ts">
  // Any dialog or floating panel: the scrim, Escape through the overlay stack, Tab kept inside,
  // focus given back on close. On a phone it fills the screen (or docks to the bottom edge
  // with `mobile="sheet"`, like a palette) and shrinks with the software keyboard.
  import type { Snippet } from "svelte";

  import { focusables, focusTrap, rememberFocus } from "../actions/focus";
  import { registerOverlay } from "../lib/overlays.svelte";
  import { lockScroll } from "../lib/scrollLock";
  import PanelHeader from "./PanelHeader.svelte";

  interface Props {
    /** Announced to screen readers; also the header's text when `title` is not given. */
    label: string;
    onclose: () => void;
    children: Snippet;
    /** Renders a header with this title and a close button. */
    title?: string;
    /** Buttons in that header, before the close button. */
    actions?: Snippet;
    /** A footer row below the body: the dialog's buttons. */
    footer?: Snippet;
    align?: "center" | "top";
    /** Distance from the top with `align="top"`. */
    offset?: string;
    width?: string;
    height?: string;
    scrim?: "normal" | "strong" | "frosted" | "none";
    /** A dialog raised from a menu or a card sits above both. */
    layer?: "modal" | "dialog" | "lightbox";
    /** Pads the body, for a panel that does not scroll internally. */
    padded?: boolean;
    /** Fills the viewport with no chrome and lets clicks beside the content reach the scrim: the lightbox. */
    fullscreen?: boolean;
    /** Fills the viewport, opaque, no border or radius: a pane shown as a page. */
    bare?: boolean;
    /** On `body.mobile`: fill the screen (default), dock to the bottom edge, or stay as it is. */
    mobile?: "fullscreen" | "sheet" | "keep";
    /** Where focus goes on open: `[data-autofocus]` or the first field (`auto`), the panel, or nowhere. */
    initialFocus?: "auto" | "panel" | "none";
    closeLabel?: string;
    /** Keys pressed anywhere inside, e.g. a viewer's arrows. */
    onkeydown?: (e: KeyboardEvent) => void;
    class?: string;
  }

  const {
    label,
    onclose,
    children,
    title,
    actions,
    footer,
    align = "center",
    offset = "10vh",
    width,
    height,
    scrim = "normal",
    layer = "modal",
    padded = false,
    fullscreen = false,
    bare = false,
    mobile = "fullscreen",
    initialFocus = "auto",
    closeLabel = "Close",
    onkeydown,
    class: extra,
  }: Props = $props();

  let panel = $state<HTMLElement | null>(null);

  $effect(() => registerOverlay(() => onclose()));

  $effect(() => rememberFocus());

  $effect(() => lockScroll());

  $effect(() => {
    const node = panel;
    if (!node || initialFocus === "none") return;
    const frame = requestAnimationFrame(() => {
      const target =
        initialFocus === "auto"
          ? (node.querySelector<HTMLElement>("[data-autofocus]") ??
            focusables(node).find((el) => el.matches("input, textarea, select")))
          : null;
      // Without preventScroll WebKit scrolls the shell up to reveal a field that never moved.
      (target ?? node).focus({ preventScroll: true });
      if (target instanceof HTMLInputElement && target.dataset.autofocus === "select")
        target.select();
    });
    return () => cancelAnimationFrame(frame);
  });
</script>

<div
  class={["modal", `mobile-${mobile}`, extra]}
  class:top={align === "top"}
  style:--modal-offset={offset}
  style:--modal-layer="var(--z-{layer})"
>
  {#if scrim !== "none"}
    <button
      type="button"
      class="scrim"
      class:strong={scrim === "strong"}
      class:frosted={scrim === "frosted"}
      tabindex="-1"
      aria-label={closeLabel}
      onclick={() => onclose()}
    ></button>
  {/if}
  <div
    class="panel"
    class:padded
    class:fullscreen
    class:bare
    role="dialog"
    aria-modal="true"
    aria-label={label}
    tabindex="-1"
    style:width
    style:height
    bind:this={panel}
    use:focusTrap
    {onkeydown}
  >
    {#if title !== undefined}
      <PanelHeader {title} {actions} onclose={() => onclose()} {closeLabel} />
    {/if}
    <div class="body">
      {@render children()}
    </div>
    {#if footer}
      <div class="footer">{@render footer()}</div>
    {/if}
  </div>
</div>

<style>
  .modal {
    position: fixed;
    inset: 0;
    z-index: var(--modal-layer);
    display: grid;
    place-items: center;
  }
  .modal.top {
    align-items: start;
    padding-top: var(--modal-offset);
  }
  .scrim {
    position: absolute;
    inset: 0;
    background: var(--scrim);
    cursor: default;
    animation: fade-in var(--dur-slow) var(--ease);
  }
  .scrim.strong {
    background: var(--scrim-strong);
  }
  .scrim.frosted {
    background: color-mix(in oklab, var(--bg) 55%, transparent);
    backdrop-filter: blur(2px);
  }
  .panel {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 2 * var(--modal-offset, 10vh));
    overflow: hidden;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-modal);
    outline: none;
    animation: rise-in var(--dur-slow) var(--ease);
  }
  .modal:not(.top) .panel {
    max-height: calc(100vh - 32px);
  }
  .body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .panel.padded .body {
    padding: var(--sp-4) var(--sp-5) var(--sp-5);
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--gap-3);
    flex: none;
    padding: var(--sp-4) var(--sp-5);
    border-top: 1px solid var(--border);
  }
  .panel.padded .footer {
    padding-top: 0;
    border-top: none;
  }
  /* It covers the window, so the scrim under it has to take the clicks that land beside its
     contents; what is a control says so itself. */
  .panel.fullscreen {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    pointer-events: none;
    animation-name: fade-in;
  }
  .panel.bare {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  /* ---- phone ---- */
  :global(body.mobile) .modal.mobile-fullscreen {
    padding: 0;
    align-items: stretch;
  }
  :global(body.mobile) .mobile-fullscreen .panel:not(.fullscreen) {
    width: 100% !important;
    height: calc(100% - var(--kb)) !important;
    max-width: none;
    max-height: none;
    align-self: start;
    border: none;
    border-radius: 0;
    padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
    animation-name: slide-up;
    animation-duration: var(--dur-sheet);
    animation-timing-function: var(--ease-sheet);
  }
  /* The palette sits on the bottom edge, field last, like Safari's search: the results stay
     above the thumb, and there is backdrop left to tap to dismiss. */
  :global(body.mobile) .modal.mobile-sheet {
    align-items: end;
    padding: 0 var(--safe-right) var(--kb) var(--safe-left);
    transition: padding-bottom var(--dur-sheet) var(--ease-sheet);
  }
  :global(body.mobile) .mobile-sheet .panel {
    width: 100% !important;
    max-width: none;
    max-height: calc(100% - var(--sheet-top));
    border-bottom: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    /* Flush with the bottom edge: the home indicator's strip is the panel's own colour. */
    padding-bottom: max(0px, var(--safe-bottom) - var(--kb));
    animation-name: slide-up;
    animation-duration: var(--dur-sheet);
    animation-timing-function: var(--ease-sheet);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
  @keyframes rise-in {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.99);
    }
  }
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
  }
</style>
