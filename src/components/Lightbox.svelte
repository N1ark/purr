<script lang="ts" module>
  export type { LightboxItem } from "./types";
</script>

<script lang="ts">
  // Pictures, videos and sounds full-size over a dimmed app: ← and → step through them, Escape
  // or a click beside the picture closes it.
  import type { Snippet } from "svelte";
  import CaretLeftIcon from "phosphor-svelte/lib/CaretLeftIcon";
  import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
  import XIcon from "phosphor-svelte/lib/XIcon";

  import IconButton from "./IconButton.svelte";
  import Modal from "./Modal.svelte";
  import type { LightboxItem } from "./types";

  interface Props {
    items: readonly LightboxItem[];
    index?: number;
    onclose: () => void;
    /** Buttons beside the counter: open in the browser, reveal in Finder. */
    actions?: Snippet<[LightboxItem, number]>;
    /** Replaces how an item is drawn, e.g. an image that needs credentials to load. */
    media?: Snippet<[LightboxItem, number]>;
    label?: string;
    closeLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
  }

  let {
    items,
    index = $bindable(0),
    onclose,
    actions,
    media,
    label = "Media viewer",
    closeLabel = "Close",
    previousLabel = "Previous",
    nextLabel = "Next",
  }: Props = $props();

  const current = $derived(items[Math.min(Math.max(0, index), items.length - 1)]);
  const caption = $derived(current?.caption ?? current?.alt);

  function step(delta: number) {
    if (items.length < 2) return;
    index = (index + delta + items.length) % items.length;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLMediaElement && (e.key === "ArrowLeft" || e.key === "ArrowRight"))
      return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  }
</script>

{#if current}
  <Modal
    {label}
    {onclose}
    {closeLabel}
    scrim="strong"
    layer="lightbox"
    fullscreen
    onkeydown={onKeydown}
  >
    <div class="stage">
      {#key current.src}
        <div class="media">
          {#if media}
            {@render media(current, index)}
          {:else if current.kind === "video"}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video src={current.src} controls autoplay playsinline></video>
          {:else if current.kind === "audio"}
            <audio src={current.src} controls autoplay></audio>
          {:else}
            <img src={current.src} alt={current.alt ?? ""} />
          {/if}
        </div>
      {/key}

      <div class="bar surface">
        {#if items.length > 1}
          <IconButton label={previousLabel} size="lg" onclick={() => step(-1)}>
            <CaretLeftIcon />
          </IconButton>
          <span class="count">{index + 1} / {items.length}</span>
          <IconButton label={nextLabel} size="lg" onclick={() => step(1)}>
            <CaretRightIcon />
          </IconButton>
        {/if}
        {#if caption || current.detail}
          <span class="caption">
            {#if caption}<span class="truncate">{caption}</span>{/if}
            {#if current.detail}<span class="detail truncate">{current.detail}</span>{/if}
          </span>
        {/if}
        {@render actions?.(current, index)}
      </div>
      <span class="corner surface">
        <IconButton label={closeLabel} size="lg" onclick={onclose}>
          <XIcon />
        </IconButton>
      </span>
    </div>
  </Modal>
{/if}

<style>
  .stage {
    --edge: 24px;
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: calc(var(--edge) + var(--safe-top)) var(--edge)
      calc(var(--edge) * 3 + var(--safe-bottom));
  }
  /* Letterboxed across the stage, and it must not swallow the click beside the picture that
     closes the viewer: only the media itself takes pointer events. */
  .media {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    min-height: 0;
  }
  .media > :global(*) {
    pointer-events: auto;
  }
  img,
  video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius);
  }
  audio {
    width: min(100%, 420px);
  }
  .bar,
  .corner {
    position: absolute;
    display: flex;
    align-items: center;
    gap: var(--sp-1);
    padding: var(--sp-1);
    box-shadow: var(--shadow-modal);
    pointer-events: auto;
  }
  .bar {
    bottom: calc(var(--edge) + var(--safe-bottom));
    left: 50%;
    max-width: calc(100% - 2 * var(--edge));
    transform: translateX(-50%);
  }
  .corner {
    top: calc(var(--edge) + var(--safe-top));
    right: var(--edge);
  }
  .count {
    padding: 0 var(--sp-2);
    font-size: var(--fs-xs);
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }
  .caption {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0 var(--sp-3);
    font-size: var(--fs-sm);
    color: var(--color2);
  }
  .detail {
    font-size: var(--fs-xs);
    color: var(--muted);
  }
</style>
