<script lang="ts">
  // A highlighted block of code with a copy button.
  import { IconButton, copyText, toast } from "purr";
  import { Check, Copy } from "purr/icons";
  import { highlight } from "../lib/highlight";

  interface Props {
    code: string;
    /** Under the block: what the code is, when the section heading does not say. */
    label?: string;
  }

  const { code, label = "Copy code" }: Props = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy() {
    if (!(await copyText(code))) {
      toast.error("Couldn't reach the clipboard");
      return;
    }
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1200);
  }
</script>

<div class="snippet">
  <pre><code>{@html highlight(code)}</code></pre>
  <div class="copy">
    <IconButton label={copied ? "Copied" : label} onclick={copy}>
      {#if copied}<Check />{:else}<Copy />{/if}
    </IconButton>
  </div>
</div>

<style>
  .snippet {
    position: relative;
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--code-bg);
  }
  pre {
    margin: 0;
    padding: var(--sp-4) calc(var(--sp-5) * 2 + var(--btn)) var(--sp-4) var(--sp-5);
    overflow-x: auto;
    font-family: var(--mono);
    font-size: var(--fs-sm);
    line-height: 1.55;
    color: var(--color2);
    tab-size: 2;
  }
  .copy {
    position: absolute;
    top: var(--sp-2);
    right: var(--sp-2);
  }
</style>
