<script lang="ts">
  import { Callout } from "purr";
  import { ICONS } from "../lib/icons";
  import type { PreviewProps } from "../lib/story";

  const { args, props }: PreviewProps = $props();

  const Icon = $derived(args.icon ? ICONS[String(args.icon)] : undefined);
  const html = $derived(
    String(args.text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"),
  );
</script>

{#snippet glyph()}
  {#if Icon}<Icon size="1.2em" />{/if}
{/snippet}

<div class="md frame">
  <Callout {...props} icon={Icon ? glyph : undefined}>
    <p>{@html html}</p>
  </Callout>
</div>

<style>
  .frame {
    width: 420px;
    max-width: 100%;
  }
</style>
