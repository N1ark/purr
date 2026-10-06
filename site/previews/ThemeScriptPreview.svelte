<script lang="ts">
  import { liveTheme, themeScript } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args }: PreviewProps = $props();

  const source = $derived(themeScript(String(args.storageKey ?? "theme")));
</script>

<div class="s-stack frame">
  <span class="muted">
    The script it writes into the head ({source.length} bytes); this page is
    <strong>{liveTheme.current}</strong>.
  </span>
  <pre class="s-out">{source}</pre>
</div>

<style>
  .frame {
    width: 100%;
  }
  pre {
    max-height: 200px;
    margin: 0;
    padding: var(--sp-3);
    overflow: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--code-bg);
    white-space: pre-wrap;
  }
</style>
