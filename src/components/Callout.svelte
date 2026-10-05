<script lang="ts">
  // An aside in running text: a note, a tip, a warning. Tinted by its tone (or any colour); a title
  // sits on a stronger band of it, an icon leads the title or sits in the top corner without one.
  import type { Snippet } from "svelte";

  type Tone = "accent" | "info" | "success" | "warn" | "danger" | "neutral";

  interface Props {
    children: Snippet;
    tone?: Tone;
    /** Any CSS colour, in place of the tone's. */
    color?: string;
    title?: string;
    icon?: Snippet;
    class?: string;
  }

  const { children, tone = "accent", color, title, icon, class: extra }: Props = $props();

  const TONES: Record<Tone, string> = {
    accent: "var(--theme)",
    info: "var(--info)",
    success: "var(--success)",
    warn: "var(--warn)",
    danger: "var(--danger)",
    neutral: "var(--muted)",
  };
</script>

<div
  class={["callout", extra]}
  class:has-corner={icon && !title}
  role="note"
  aria-label={title}
  style:--callout-c={color ?? TONES[tone]}
>
  {#if title}
    <p class="title">
      {#if icon}<span class="icon">{@render icon()}</span>{/if}
      {title}
    </p>
  {:else if icon}
    <span class="corner">{@render icon()}</span>
  {/if}
  <div class="body">{@render children()}</div>
</div>

<style>
  /* Tuned from outside through `--callout-tint` (the body's colour), `--callout-head-tint` (the
     title band's), `--callout-pad`, `--callout-border` and `--callout-shadow`. */
  .callout {
    position: relative;
    margin: var(--md-block, var(--sp-4)) 0;
    border: var(--callout-border, 1px solid color-mix(in oklab, var(--callout-c) 24%, transparent));
    border-radius: var(--radius);
    background: color-mix(in oklab, var(--callout-c) var(--callout-tint, 5%), var(--bg));
    box-shadow: var(--callout-shadow, none);
    transition:
      background-color var(--dur-slow),
      color var(--dur-slow);
  }
  /* The tone's own hue, held to a readable lightness the way `.ink` is. */
  .title,
  .corner {
    color: color-mix(in oklab, var(--callout-c) 70%, var(--color2));
    color: oklch(from var(--callout-c) clamp(var(--ink-min), l, var(--ink-max)) c h);
  }
  .title {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    margin: 0;
    padding: var(--sp-2) var(--sp-5);
    border-radius: calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0;
    background: color-mix(in oklab, var(--callout-c) var(--callout-head-tint, 14%), var(--bg));
    font-weight: 650;
  }
  .icon {
    display: inline-flex;
    flex: none;
  }
  .corner {
    position: absolute;
    top: var(--sp-4);
    right: var(--sp-3);
    display: flex;
    align-items: flex-start;
  }
  .body {
    padding: var(--callout-pad, var(--sp-4) var(--sp-5));
  }
  .has-corner .body {
    padding-right: var(--callout-corner, 3.5em);
  }
  .body > :global(:first-child) {
    margin-top: 0;
  }
  .body > :global(:last-child) {
    margin-bottom: 0;
  }
</style>
