<script lang="ts">
  import { Button, Highlight, Popover, fuzzyMatch } from "purr";
  import { GitBranch } from "purr/icons";
  import type { PreviewProps } from "../lib/story";

  const { args, props, on }: PreviewProps = $props();

  const BRANCHES = [
    "main",
    "feature/menus",
    "feature/palette",
    "fix/tooltip-flicker",
    "release/0.2",
  ];
  let anchor = $state<HTMLElement | null>(null);
  let open = $state(false);
  let branch = $state("main");
  let filter = $state("");
  const hits = $derived(
    BRANCHES.map((b) => ({ b, m: fuzzyMatch(filter, b) }))
      .filter((x) => x.m)
      .sort((a, b) => b.m!.score - a.m!.score),
  );

  function close() {
    on.onclose();
    open = false;
  }

  function pick(b: string) {
    branch = b;
    close();
  }
</script>

<span class="anchor" bind:this={anchor}>
  <Button onclick={() => (open ? close() : (open = true))} aria-expanded={open}>
    <GitBranch />
    {branch}
  </Button>
</span>

{#if open && anchor}
  <Popover {...props} {anchor} label={String(args.label)} onclose={close}>
    <input
      class="field-input"
      placeholder="Switch to branch…"
      aria-label="Filter branches"
      bind:value={filter}
      onkeydown={(e) => {
        if (e.key === "Enter" && hits[0]) pick(hits[0].b);
      }}
    />
    <div class="branches">
      {#each hits as { b, m } (b)}
        <button
          type="button"
          class="row-item"
          class:is-current={b === branch}
          role={args.role === "listbox" ? "option" : "menuitem"}
          aria-selected={args.role === "listbox" ? b === branch : undefined}
          onclick={() => pick(b)}><Highlight text={b} indices={m?.indices ?? []} /></button
        >
      {/each}
    </div>
  </Popover>
{/if}

<style>
  .anchor {
    display: inline-flex;
  }
  .field-input {
    width: 100%;
  }
  .branches {
    display: flex;
    flex-direction: column;
    margin-top: var(--sp-2);
  }
</style>
