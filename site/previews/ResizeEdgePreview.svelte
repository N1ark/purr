<script lang="ts">
  import { ResizeEdge, type ResizeSide } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, on }: PreviewProps = $props();
  let size = $state(200);

  const side = $derived(args.side as ResizeSide);
  const vertical = $derived(side === "top" || side === "bottom");
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);
</script>

<div class="panes surface" class:vertical class:reverse={side === "right" || side === "bottom"}>
  <div
    class="pane"
    style:width={vertical ? undefined : `${size}px`}
    style:height={vertical ? `${size}px` : undefined}
  >
    <span>{size}px</span>
    <ResizeEdge
      {size}
      {side}
      label={String(args.label)}
      min={num(args.min)}
      max={num(args.max)}
      preset={num(args.preset)}
      onresize={(px) => {
        size = px;
        on.onresize(px);
      }}
      oncommit={on.oncommit}
    />
  </div>
  <div class="main muted">Drag or focus the edge</div>
</div>

<style>
  .panes {
    display: flex;
    width: 560px;
    max-width: 100%;
    height: 220px;
    overflow: hidden;
  }
  .panes.reverse {
    flex-direction: row-reverse;
  }
  .panes.vertical {
    flex-direction: column;
    height: 420px;
  }
  .panes.vertical.reverse {
    flex-direction: column-reverse;
  }
  .pane {
    position: relative;
    display: grid;
    place-items: center;
    flex: none;
    background: var(--bg2);
    font-size: var(--fs-sm);
  }
  .main {
    display: grid;
    flex: 1;
    place-items: center;
    min-width: 0;
    min-height: 0;
    font-size: var(--fs-sm);
  }
</style>
