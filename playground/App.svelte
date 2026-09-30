<script lang="ts">
  import { Segmented } from "purr";
  import Behaviour from "./Behaviour.svelte";
  import Primitives from "./Primitives.svelte";

  type Theme = "light" | "dark";
  type Density = "compact" | "cozy" | "dense";
  type Page = "primitives" | "behaviour";

  // `?theme=dark&density=cozy` overrides what was remembered, for screenshots.
  const query = new URLSearchParams(location.search);
  const read = <T extends string>(key: string, fallback: T): T => {
    const forced = query.get(key);
    if (forced) return forced as T;
    try {
      return (localStorage.getItem(`purr.playground.${key}`) as T | null) ?? fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key: string, value: string) => {
    try {
      localStorage.setItem(`purr.playground.${key}`, value);
    } catch {
      // A private window keeps no preferences; the defaults are fine.
    }
  };

  let theme = $state<Theme>(read("theme", "light"));
  let density = $state<Density>(read("density", "compact"));
  let page = $state<Page>(read("page", "primitives"));

  $effect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("density-cozy", density === "cozy");
    html.classList.toggle("density-dense", density === "dense");
    write("theme", theme);
    write("density", density);
    write("page", page);
  });
</script>

<div class="shell">
  <header class="bar">
    <strong class="brand">purr</strong>
    <Segmented
      label="Page"
      bind:value={page}
      options={[
        { id: "primitives", label: "Primitives" },
        { id: "behaviour", label: "Behaviour" },
      ]}
    />
    <span class="spacer"></span>
    <Segmented
      label="Theme"
      size="sm"
      bind:value={theme}
      options={[
        { id: "light", label: "Light" },
        { id: "dark", label: "Dark" },
      ]}
    />
    <Segmented
      label="Density"
      size="sm"
      bind:value={density}
      options={[
        { id: "dense", label: "Dense" },
        { id: "compact", label: "Compact" },
        { id: "cozy", label: "Cozy" },
      ]}
    />
  </header>
  <main class="scroll">
    {#if page === "primitives"}
      <Primitives />
    {:else}
      <Behaviour />
    {/if}
  </main>
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-4);
    flex: none;
    padding: var(--sp-3) var(--sp-5);
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
  }
  .brand {
    font-size: var(--fs-lg);
    color: var(--theme2);
  }
  .spacer {
    flex: 1;
  }
  .scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: var(--sp-5);
  }
</style>
