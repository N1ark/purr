<script lang="ts">
  // The shell: a bar with the look controls, the page list, and the current page. Built from
  // purr itself.
  import {
    ACCENTS,
    Button,
    ColorGrid,
    ContextMenuHost,
    DialogHost,
    EmptyState,
    IconButton,
    Popover,
    Segmented,
    ShortcutsOverlay,
    Spinner,
    Tag,
    ToastHost,
    accentSwatch,
    createKeymap,
    registerOverlay,
    tooltip,
    type Binding,
    type Density,
  } from "purr";
  import {
    GithubLogo,
    HandTap,
    List,
    MagnifyingGlass,
    Moon,
    Palette,
    Sun,
    Warning,
  } from "purr/icons";
  import { version } from "../package.json";
  import Home from "./components/Home.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import Story from "./components/Story.svelte";
  import { REPO, hosts, look, paint, route, setTouch, touch } from "./lib/site.svelte";
  import { pageBySlug } from "./pages";

  const page = $derived(pageBySlug(route.path));

  /**
   * A fetch that stalls gives up after a while rather than leaving the pane blank. "Try again"
   * reloads: the browser would hand a second import the same stuck request.
   */
  function loadPage<T>(load: () => Promise<T>): Promise<T> {
    return Promise.race([
      load(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("The page took too long to arrive.")), 10_000),
      ),
    ]);
  }

  let main = $state<HTMLElement | null>(null);
  let filter = $state<HTMLInputElement | null>(null);
  let accentButton = $state<HTMLElement | null>(null);
  let accentOpen = $state(false);
  let navOpen = $state(false);
  let help = $state(false);
  let nav = $state<HTMLElement | null>(null);
  let navButton = $state<HTMLElement | null>(null);

  $effect(() => paint());

  // A new page starts at its top, with the drawer (on a phone) out of the way.
  $effect(() => {
    void route.path;
    navOpen = false;
    main?.scrollTo({ top: 0 });
    document.title = page ? `${page.title} · purr` : "purr";
  });

  $effect(() => {
    if (!navOpen) return;
    return registerOverlay(() => (navOpen = false), {
      element: () => nav,
      ignore: () => navButton,
    });
  });

  type Action = "filter" | "help" | "theme";
  const BINDINGS: Binding<Action>[] = [
    { keys: "/", action: "filter", label: "Filter the pages" },
    { keys: "⌘K", action: "filter", label: "Filter the pages" },
    { keys: "t", action: "theme", label: "Light or dark" },
    { keys: "?", action: "help", label: "Show these shortcuts" },
  ];
  const keymap = createKeymap(BINDINGS);

  function run(action: Action) {
    if (action === "filter") {
      navOpen = true;
      requestAnimationFrame(() => filter?.focus());
    } else if (action === "theme") toggleTheme();
    else help = true;
  }

  function toggleTheme() {
    look.theme.value = look.theme.value === "dark" ? "light" : "dark";
  }

  const accent = $derived(ACCENTS.find((a) => a.id === look.accent.value) ?? ACCENTS[0]);
  const swatches = $derived(ACCENTS.map((a) => accentSwatch(a.id, look.theme.value)));
  const accentOf = (color: string | null) =>
    ACCENTS.find((a) => accentSwatch(a.id, look.theme.value) === color);

  const DENSITIES: { id: Density; label: string }[] = [
    { id: "dense", label: "Dense" },
    { id: "compact", label: "Compact" },
    { id: "cozy", label: "Cozy" },
  ];
</script>

<svelte:window onkeydown={(e) => keymap.handle(e, run)} />

<ContextMenuHost />
<DialogHost />
<ToastHost position={hosts.toast.position} dismissLabel={hosts.toast.dismissLabel} />

<div class="shell" class:nav-open={navOpen}>
  <header class="bar">
    <span class="menu-button" bind:this={navButton}>
      <IconButton
        label="Pages"
        size="lg"
        aria-expanded={navOpen}
        onclick={() => (navOpen = !navOpen)}><List /></IconButton
      >
    </span>
    <a class="brand" href="#/">purr</a>
    <Tag label={`v${version}`} />
    <span class="spacer"></span>
    <IconButton label="Filter the pages" shortcut="/" size="lg" onclick={() => run("filter")}>
      <MagnifyingGlass />
    </IconButton>
    <span class="wide">
      <Segmented
        label="Density"
        size="sm"
        options={DENSITIES}
        bind:value={() => look.density.value, (d: Density) => (look.density.value = d)}
      />
    </span>
    <span bind:this={accentButton}>
      <IconButton
        label="Accent: {accent.label}"
        size="lg"
        aria-expanded={accentOpen}
        onclick={() => (accentOpen = !accentOpen)}
      >
        <Palette weight="fill" color="var(--theme2)" />
      </IconButton>
    </span>
    <IconButton
      label={look.theme.value === "dark" ? "Light theme" : "Dark theme"}
      shortcut="t"
      size="lg"
      onclick={toggleTheme}
    >
      {#if look.theme.value === "dark"}<Sun />{:else}<Moon />{/if}
    </IconButton>
    <IconButton
      label="Touch sizing (body.mobile)"
      size="lg"
      pressed={touch.on}
      onclick={() => setTouch(!touch.on)}
    >
      <HandTap />
    </IconButton>
    <a
      class="btn btn--icon btn--ghost btn--lg"
      href={REPO}
      target="_blank"
      rel="noreferrer"
      aria-label="purr on GitHub"
      use:tooltip={"purr on GitHub"}><GithubLogo /></a
    >
  </header>

  {#if navOpen}<div class="scrim" aria-hidden="true"></div>{/if}
  <aside class="nav" bind:this={nav}>
    <Sidebar bind:input={filter} />
  </aside>

  <main class="main" bind:this={main}>
    <div class="page">
      {#key route.path}
        {#if !route.path}
          <Home />
        {:else if page?.story}
          <Story story={page.story} />
        {:else if page?.component}
          <page.component />
        {:else if page?.load}
          {#await loadPage(page.load)}
            <div class="loading"><Spinner size="20px" label="Loading the page" /></div>
          {:then module}
            <module.default />
          {:catch error}
            <EmptyState icon={Warning} text="This page didn't load" hint={String(error)}>
              {#snippet action()}<Button onclick={() => location.reload()}>Try again</Button
                >{/snippet}
            </EmptyState>
          {/await}
        {:else}
          <EmptyState icon={Warning} text="No page at “{route.path}”">
            {#snippet action()}<a class="btn" href="#/">Back to the start</a>{/snippet}
          </EmptyState>
        {/if}
      {/key}
    </div>
  </main>
</div>

{#if accentOpen && accentButton}
  <Popover
    anchor={accentButton}
    placement="bottom-end"
    label="Accent and density"
    padding="var(--sp-4)"
    onclose={() => (accentOpen = false)}
    autofocus
  >
    <div class="look">
      <span class="caption">Accent</span>
      <ColorGrid
        label="Accent"
        colors={swatches}
        columns={4}
        value={accentSwatch(accent.id, look.theme.value)}
        colorLabel={(c) => accentOf(c)?.label ?? c}
        colorTip={(c) => accentOf(c)?.label ?? null}
        onpick={(c) => {
          const picked = accentOf(c);
          if (picked) look.accent.value = picked.id;
        }}
      />
      <span class="caption narrow">Density</span>
      <span class="narrow">
        <Segmented
          label="Density"
          size="sm"
          options={DENSITIES}
          bind:value={() => look.density.value, (d: Density) => (look.density.value = d)}
        />
      </span>
    </div>
  </Popover>
{/if}

{#if help}
  <ShortcutsOverlay groups={keymap.help()} onclose={() => (help = false)} />
{/if}

<style>
  .shell {
    display: grid;
    grid-template-columns: 236px minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      "bar bar"
      "nav main";
    height: 100%;
  }
  .bar {
    grid-area: bar;
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    min-width: 0;
    padding: var(--sp-2) var(--sp-4);
    padding-top: calc(var(--sp-2) + var(--safe-top));
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
  }
  .brand {
    padding: 0 var(--sp-2);
    font-size: var(--fs-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--theme2);
    text-decoration: none;
  }
  .spacer {
    flex: 1;
  }
  .menu-button {
    display: none;
  }
  .nav {
    grid-area: nav;
    min-height: 0;
    border-right: 1px solid var(--border);
    background: var(--bg2);
  }
  .main {
    grid-area: main;
    min-height: 0;
    overflow-y: auto;
  }
  .page {
    max-width: 1180px;
    margin: 0 auto;
    padding: calc(var(--sp-5) * 2) calc(var(--sp-5) * 2.5) calc(var(--sp-5) * 4);
    padding-bottom: calc(var(--sp-5) * 4 + var(--safe-bottom));
  }
  .look {
    display: grid;
    gap: var(--sp-3);
  }
  .caption {
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .narrow {
    display: none;
  }
  .scrim {
    display: none;
  }

  @media (max-width: 760px) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        "bar"
        "main";
    }
    .menu-button {
      display: inline-flex;
    }
    .wide {
      display: none;
    }
    .narrow {
      display: inline-flex;
    }
    .nav {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: var(--z-sheet);
      width: min(300px, 85vw);
      padding-top: var(--safe-top);
      box-shadow: var(--shadow-lg);
      transform: translateX(-105%);
      transition: transform var(--dur-slow) var(--ease);
    }
    .nav-open .nav {
      transform: none;
    }
    .scrim {
      display: block;
      position: fixed;
      inset: 0;
      z-index: var(--z-popover);
      background: var(--scrim);
    }
    .page {
      padding: var(--sp-5) var(--sp-5) calc(var(--sp-5) * 3 + var(--safe-bottom));
    }
  }
  .loading {
    display: grid;
    place-items: center;
    padding: var(--sp-5) 0;
    color: var(--muted);
  }
</style>
