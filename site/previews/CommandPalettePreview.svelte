<script lang="ts">
  import { Button, CommandPalette, Kbd, type PaletteItem } from "purr";
  import { Plus, Terminal } from "purr/icons";
  import { COMMANDS, NOTES } from "../lib/samples";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();
  let open = $state(false);
  let query = $state("");

  const commands = $derived(args.source === "commands");
  const items = $derived(
    (commands ? COMMANDS : NOTES).map((item) => ({
      ...item,
      run: (e: KeyboardEvent | MouseEvent) => on["item.run"]?.(item.label, e),
    })),
  );

  function close() {
    on.onclose();
    open = false;
  }

  const create = (q: string): PaletteItem => ({
    id: "create",
    label: `Create “${q}”`,
    icon: Plus,
    run: () => on["item.run"]?.(`Create ${q}`),
  });
</script>

<Button variant="primary" onclick={() => (open = true)}>
  {#if commands}<Terminal />{/if} Open the palette <Kbd hint="⌘K" />
</Button>
<p class="muted">Bind <code>query</code> to keep what was typed across openings.</p>

{#if open}
  <CommandPalette
    {...props}
    {items}
    bind:query
    create={args.create ? create : undefined}
    onclose={close}
  />
{/if}

<style>
  p {
    width: 100%;
    margin: 0;
    text-align: center;
    font-size: var(--fs-sm);
  }
</style>
