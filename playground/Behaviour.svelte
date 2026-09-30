<script lang="ts">
  import {
    ACCENTS,
    Banner,
    Button,
    CommandPalette,
    ContextMenuHost,
    DialogHost,
    Highlight,
    IconButton,
    Kbd,
    Lightbox,
    MOD,
    Menu,
    Modal,
    Popover,
    ResizeEdge,
    Sheet,
    ShortcutsOverlay,
    ToastHost,
    VirtualList,
    accentSwatch,
    applyTheme,
    confirmAction,
    createKeymap,
    createUpdater,
    currentTheme,
    dragList,
    entries as menuEntries,
    formatRelative,
    formatShortcut,
    fuzzyMatch,
    menu,
    moveItem,
    noteSummary,
    os,
    promptText,
    toast,
    tooltip,
    type Binding,
    type LightboxItem,
    type MaybeEntry,
    type MenuControl,
    type PaletteItem,
    type UpdateInfo,
  } from "purr";
  import {
    AlignCenterHorizontal,
    AlignLeft,
    AlignRight,
    ArrowDown,
    ArrowRight,
    ArrowSquareOut,
    Copy,
    DotsThree,
    FolderOpen,
    Gear,
    GitBranch,
    Keyboard,
    Note,
    Plus,
    Terminal,
    Trash,
  } from "purr/icons";

  // ---- keymap: one table drives the keys and the `?` overlay ----

  type Action = "notes" | "commands" | "help" | "toast" | "lightbox" | "menu";
  const BINDINGS: Binding<Action>[] = [
    { keys: "⌘K", action: "notes", label: "Jump to a note", group: "General" },
    { keys: "⇧⌘K", action: "commands", label: "Run a command", group: "General" },
    { keys: "?", action: "help", label: "Show this list", group: "General" },
    { keys: "t", action: "toast", label: "Say something", group: "Demo" },
    { keys: "g l", action: "lightbox", label: "Open the lightbox", group: "Demo" },
    { keys: "g m", action: "menu", label: "Open a menu in the middle", group: "Demo" },
  ];
  const keymap = createKeymap(BINDINGS);
  const help = keymap.help({
    extra: [{ label: "Close what's open", hints: ["Esc"], group: "General" }],
  });

  function run(action: Action) {
    if (action === "notes") palette = "notes";
    else if (action === "commands") palette = "commands";
    else if (action === "help") showHelp = true;
    else if (action === "toast") toast("Pressed t");
    else if (action === "lightbox") lightbox = 0;
    else if (action === "menu")
      menu.showAt(innerWidth / 2, innerHeight / 3, noteMenu(), "From the keyboard");
  }

  // ---- menus ----

  const STAGES = [
    { name: "Todo", color: "#61afef" },
    { name: "Doing", color: "#e5c07b" },
    { name: "Done", color: "#98c379" },
  ];
  const COLORS = [
    "#b045ab",
    "#c678dd",
    "#61afef",
    "#56b6c2",
    "#98c379",
    "#e5c07b",
    "#d19a66",
    "#e06c75",
  ];
  let status = $state("Doing");
  let tagged = $state<string[]>(["design"]);
  let allTags = $state(["design", "urgent", "later"]);
  let color = $state("#61afef");
  let newTag = $state("");
  let sheetMenu = $state(false);

  function noteMenu(): MaybeEntry[] {
    return [
      { label: "Open", run: () => toast("Opened") },
      {
        label: "Open in new window",
        icon: ArrowSquareOut,
        hint: "⌘↩",
        run: () => toast("New window"),
      },
      { label: "Copy", icon: Copy, hint: "⌘C", run: () => toast("Copied") },
      {
        label: "Reveal in Finder",
        icon: FolderOpen,
        disabled: true,
        note: "Only in the desktop app.",
      },
      "separator",
      { kind: "heading", label: "Status" },
      ...STAGES.map((s) => ({
        label: s.name,
        swatch: s.color,
        checked: status === s.name,
        run: () => (status = s.name),
      })),
      { kind: "heading", label: "Tags" },
      ...allTags.map((tag) => ({
        label: tag,
        checked: tagged.includes(tag),
        keepOpen: true,
        run: () =>
          (tagged = tagged.includes(tag) ? tagged.filter((t) => t !== tag) : [...tagged, tag]),
      })),
      { kind: "custom", render: tagInput },
      "separator",
      { kind: "custom", render: alignGrid },
      {
        label: "Move to",
        icon: ArrowRight,
        items: [
          { label: "Inbox", run: () => toast("Moved to Inbox") },
          { label: "Archive", run: () => toast("Archived") },
          "separator",
          {
            label: "Project",
            items: [
              { label: "Dagobert", run: () => toast("Dagobert") },
              { label: "Legit", run: () => toast("Legit") },
              { label: "Tulip", run: () => toast("Tulip") },
            ],
          },
        ],
      },
      { kind: "heading", label: "Colour" },
      {
        kind: "colors",
        colors: COLORS,
        selected: color,
        pick: (c) => (color = c),
        custom: (c) => (color = c),
        label: "Colour",
      },
      "separator",
      {
        label: "Delete",
        icon: Trash,
        danger: true,
        confirm: "Really delete?",
        run: () => toast("Deleted"),
      },
    ];
  }

  function addTag(control: MenuControl) {
    const tag = newTag.trim();
    if (!tag) return;
    if (!allTags.includes(tag)) allTags = [...allTags, tag];
    tagged = [...tagged, tag];
    newTag = "";
    control.close();
  }

  // ---- popover ----

  const BRANCHES = [
    "main",
    "feature/menus",
    "feature/palette",
    "fix/tooltip-flicker",
    "release/0.2",
  ];
  let branchAnchor = $state<HTMLElement | null>(null);
  let branchOpen = $state(false);
  let branch = $state("main");
  let branchFilter = $state("");
  const branchHits = $derived(
    BRANCHES.map((b) => ({ b, m: fuzzyMatch(branchFilter, b) }))
      .filter((x) => x.m)
      .sort((a, b) => b.m!.score - a.m!.score),
  );

  // ---- modals ----

  let modal = $state<null | "titled" | "top" | "bare">(null);
  let showHelp = $state(false);

  async function ask() {
    const ok = await confirmAction("Discard this draft?", {
      description: "It has not been sent, and it cannot be brought back.",
      confirmLabel: "Discard",
      danger: true,
    });
    toast(ok ? "Discarded" : "Kept");
  }

  async function rename() {
    const name = await promptText("Rename topic", { label: "New name", value: "Menus" });
    if (name) toast(`Renamed to “${name}”`);
  }

  // ---- palette ----

  let palette = $state<null | "notes" | "commands">(null);
  const WORDS = [
    "design",
    "schema",
    "render",
    "sheet",
    "menu",
    "palette",
    "tooltip",
    "graph",
    "sync",
    "merge",
  ];
  const NOTES: PaletteItem[] = Array.from({ length: 5000 }, (_, i) => ({
    id: `n${i}`,
    label: `${WORDS[i % 10]} ${WORDS[(i * 7) % 10]} ${i}`,
    detail: i % 3 ? `#${WORDS[(i * 3) % 10]}` : undefined,
    icon: Note,
    run: (e) => toast(`Opened note ${i}${e.metaKey || e.ctrlKey ? " in a new window" : ""}`),
  }));
  const COMMANDS: PaletteItem[] = [
    { id: "new", label: "New note", icon: Plus, hint: "⌘N", run: () => toast("New note") },
    { id: "settings", label: "Settings", icon: Gear, hint: "⌘,", run: () => toast("Settings") },
    {
      id: "help",
      label: "Keyboard shortcuts",
      icon: Keyboard,
      hint: "?",
      run: () => (showHelp = true),
    },
    {
      id: "branch",
      label: "Switch branch",
      icon: GitBranch,
      keywords: ["git", "checkout"],
      run: () => (branchOpen = true),
    },
    {
      id: "theme",
      label: "Toggle dark theme",
      keywords: ["appearance"],
      run: () => toast("Use the switch in the bar"),
    },
  ];

  // ---- lists ----

  const ROWS = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Row ${i + 1}` }));
  const TALL = Array.from({ length: 2000 }, (_, i) => ({ id: i, lines: 1 + (i % 4) }));
  let order = $state(["Inbox", "Mentions", "Starred", "Drafts", "Channels", "People"]);

  // ---- panes, sheets, media ----

  let paneWidth = $state(220);
  let sheetOpen = $state(false);
  let sheetFull = $state(false);
  let lightbox = $state<number | null>(null);
  const picture = (a: string, b: string, label: string) =>
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/><text x="400" y="270" font-family="sans-serif" font-size="48" fill="#fff" text-anchor="middle">${label}</text></svg>`,
    );
  const MEDIA: LightboxItem[] = [
    {
      src: picture("#f4ae55", "#a138bd", "One"),
      alt: "An orange-to-purple gradient",
      detail: "800 × 500",
    },
    {
      src: picture("#56b6c2", "#27508f", "Two"),
      alt: "A teal-to-blue gradient",
      detail: "800 × 500",
    },
    { src: picture("#98c379", "#2f6b38", "Three"), caption: "Green", detail: "800 × 500" },
  ];

  // ---- updater ----

  const NOTES_MD =
    "## Added\n\n- Menus walk with the arrows\n- A palette for everything\n\n## Fixed\n\n- Tooltips no longer flicker";
  const updater = createUpdater({
    check: () =>
      new Promise<UpdateInfo | null>((r) =>
        setTimeout(() => r({ version: "0.2.0", notes: NOTES_MD }), 500),
      ),
    download: () => new Promise((r) => setTimeout(r, 700)),
    restart: async () => void toast("Restarting…"),
  });

  // ---- highlight ----

  let needle = $state("sch");
  const SENTENCES = ["Design the Schema", "soteria-rust", "QuickSwitcher.svelte", "git dialog"];

  const accent = $state({ id: "purple" });
  const at = Date.now();
</script>

<svelte:window onkeydown={(e) => keymap.handle(e, run)} />

<ContextMenuHost />
<DialogHost />
<ToastHost />

{#snippet tagInput(control: MenuControl)}
  <form
    class="tag-input"
    onsubmit={(e) => {
      e.preventDefault();
      addTag(control);
    }}
  >
    <input class="field-input" placeholder="New tag…" bind:value={newTag} />
  </form>
{/snippet}

{#snippet alignGrid(control: MenuControl)}
  <div class="aligns">
    {#each [["Align left", AlignLeft], ["Centre", AlignCenterHorizontal], ["Align right", AlignRight]] as const as [label, Icon] (label)}
      <button
        type="button"
        class="btn btn--icon btn--ghost"
        role="menuitem"
        aria-label={label}
        use:tooltip={label}
        onclick={() => {
          control.close();
          toast(label);
        }}><Icon /></button
      >
    {/each}
  </div>
{/snippet}

<div class="page">
  <section>
    <h2>Menus</h2>
    <p class="muted">
      Right-click the box, or press <Kbd hint="g m" />. Arrows walk it, → opens a submenu, letters
      jump, the tag list stays open while you toggle, and Delete takes two presses.
    </p>
    <div class="row">
      <div
        class="target surface"
        role="application"
        aria-label="Right-click for a menu"
        oncontextmenu={(e) => menu.show(e, noteMenu(), "Design the schema")}
      >
        Right-click here · {status} · {tagged.join(", ") || "no tags"}
        <span class="dot" style:background={color}></span>
      </div>
      <IconButton
        label="More"
        onclick={(e) => menu.showFor(e.currentTarget, noteMenu(), null, "bottom-end")}
      >
        <DotsThree weight="bold" />
      </IconButton>
      <Button onclick={() => (sheetMenu = true)}>As an action sheet</Button>
    </div>
    {#if sheetMenu}
      <Menu
        sheet
        entries={menuEntries(...noteMenu())}
        anchor={{ x: 0, y: 0 }}
        title="On a phone"
        onclose={() => (sheetMenu = false)}
      />
    {/if}
  </section>

  <section>
    <h2>Popover</h2>
    <div class="row">
      <span class="anchor" bind:this={branchAnchor}>
        <Button onclick={() => (branchOpen = !branchOpen)} aria-expanded={branchOpen}>
          <GitBranch />
          {branch}
        </Button>
      </span>
      <span class="muted">Anchored, flips when there is no room below, gives focus back.</span>
    </div>
    {#if branchOpen && branchAnchor}
      <Popover
        anchor={branchAnchor}
        label="Switch branch"
        onclose={() => (branchOpen = false)}
        width="280px"
        padding="var(--sp-2)"
        autofocus
      >
        <input
          class="field-input"
          placeholder="Switch to branch…"
          bind:value={branchFilter}
          onkeydown={(e) => {
            if (e.key === "Enter" && branchHits[0]) {
              branch = branchHits[0].b;
              branchOpen = false;
            }
          }}
        />
        <div class="branches" role="menu" aria-label="Branches">
          {#each branchHits as { b, m } (b)}
            <button
              type="button"
              class="row-item"
              class:is-current={b === branch}
              role="menuitem"
              onclick={() => {
                branch = b;
                branchOpen = false;
              }}><Highlight text={b} indices={m?.indices ?? []} /></button
            >
          {/each}
        </div>
      </Popover>
    {/if}
  </section>

  <section>
    <h2>Modals and dialogs</h2>
    <div class="row">
      <Button onclick={() => (modal = "titled")}>With a title</Button>
      <Button onclick={() => (modal = "top")}>Top, frosted</Button>
      <Button onclick={() => (modal = "bare")}>Bare pane</Button>
      <Button variant="danger" onclick={ask}>Confirm…</Button>
      <Button onclick={rename}>Prompt…</Button>
      <Button onclick={() => (showHelp = true)}><Keyboard /> Shortcuts <Kbd hint="?" /></Button>
    </div>
  </section>

  <section>
    <h2>Command palette</h2>
    <div class="row">
      <Button onclick={() => (palette = "notes")}>Notes (5,000) <Kbd hint="⌘K" /></Button>
      <Button onclick={() => (palette = "commands")}
        ><Terminal /> Commands <Kbd hint="⇧⌘K" /></Button
      >
      <span class="muted">Fuzzy-ranked, highlighted, windowed; ⌘↩ passes the modifier on.</span>
    </div>
  </section>

  <section>
    <h2>Tooltips and keys</h2>
    <div class="row">
      <button type="button" class="btn" use:tooltip={"Instant, unlike title"}>Text</button>
      <button type="button" class="btn" use:tooltip={{ text: "Undo", hint: "⌘Z" }}
        >With a shortcut</button
      >
      <button type="button" class="btn" use:tooltip={{ html: "<b>Bold</b> and <code>code</code>" }}
        >HTML</button
      >
      <button
        type="button"
        class="btn"
        use:tooltip={() => `Asked at ${new Date().toLocaleTimeString()}`}
        >Evaluated per hover</button
      >
      <IconButton label="Copy"><Copy /></IconButton>
    </div>
    <div class="row">
      <span class="muted">{os}, modifier {MOD}:</span>
      <Kbd hint="⇧⌘K" /><Kbd hint="⌥↓" /><Kbd hint="⌘↩" /><Kbd hint="g i" /><Kbd hint="Esc" />
      <span class="muted">· elsewhere: {formatShortcut("⇧⌘K", { mac: false })}</span>
    </div>
    <div class="row">
      <input class="field-input" bind:value={needle} aria-label="Fuzzy query" style:width="120px" />
      {#each SENTENCES as text (text)}
        {@const m = fuzzyMatch(needle, text)}
        <span class:faint={!m}><Highlight {text} indices={m?.indices ?? []} /></span>
      {/each}
    </div>
  </section>

  <section>
    <h2>Virtual lists</h2>
    <div class="grid">
      <div class="box surface">
        <VirtualList items={ROWS} rowHeight={26} key={(r) => r.id} label="Ten thousand rows">
          {#snippet children(r)}
            <div class="row-item">{r.name}</div>
          {/snippet}
        </VirtualList>
      </div>
      <div class="box surface">
        <VirtualList items={TALL} rowHeight={(r) => 12 + r.lines * 18} key={(r) => r.id}>
          {#snippet children(r)}
            <div class="tall">{r.lines} line{r.lines > 1 ? "s" : ""} · row {r.id + 1}</div>
          {/snippet}
        </VirtualList>
      </div>
      <div
        class="box surface order"
        use:dragList={{
          group: "demo",
          onreorder: (from, to) => (order = moveItem(order, from, to)),
        }}
      >
        {#each order as name, i (name)}
          <div class="row-item" data-dnd-index={i}>{name}</div>
        {/each}
      </div>
    </div>
  </section>

  <section>
    <h2>Panes, sheets and media</h2>
    <div class="row top">
      <div class="panes surface">
        <aside style:width="{paneWidth}px">
          Drag or focus the edge · {paneWidth}px
          <ResizeEdge
            size={paneWidth}
            side="left"
            label="Resize the sidebar"
            preset={220}
            onresize={(w) => (paneWidth = w)}
            oncommit={(w) => toast(`Saved ${w}px`)}
          />
        </aside>
        <div class="main muted">Double-click the edge to reset</div>
      </div>
      <div class="stack">
        <Button onclick={() => (sheetOpen = true)}>Open a sheet</Button>
        <Button onclick={() => (lightbox = 0)}>Open the lightbox</Button>
      </div>
    </div>
  </section>

  <section>
    <h2>Toasts, banners, updates</h2>
    <div class="row">
      <Button onclick={() => toast("Copied path")}>Info</Button>
      <Button onclick={() => toast.success("Pushed to origin")}>Success</Button>
      <Button onclick={() => toast.error(new Error("Couldn't access the clipboard"))}>Error</Button>
      <Button
        onclick={() =>
          toast("Undid: move", { action: { label: "Redo", run: () => toast("Redid") } })}
      >
        With an action
      </Button>
      <Button
        loading={updater.stage === "checking" || updater.stage === "downloading"}
        onclick={() => updater.check(true)}
      >
        Check for updates · {updater.stage}
      </Button>
    </div>
    <Banner
      placement="inline"
      icon={ArrowDown}
      title="An inline banner"
      lines={[
        `Written ${formatRelative(at - 5 * 60_000)}`,
        "Tone, icon, actions and dismissal are all optional.",
      ]}
    />
  </section>

  <section>
    <h2>Accent</h2>
    <div class="row">
      {#each ACCENTS as a (a.id)}
        <button
          type="button"
          class="swatch"
          aria-label={a.label}
          aria-pressed={accent.id === a.id}
          style:--c={accentSwatch(a.id, currentTheme())}
          use:tooltip={a.label}
          onclick={() => {
            accent.id = a.id;
            applyTheme({ mode: currentTheme(), accent: a.id });
          }}
        ></button>
      {/each}
    </div>
  </section>
</div>

{#if modal === "titled"}
  <Modal label="Settings" title="Settings" onclose={() => (modal = null)} width="420px" padded>
    <p>
      A header with a close button, a padded body and a footer. Tab stays inside; Escape closes.
    </p>
    <input class="field-input" placeholder="Focused on open" />
    {#snippet footer()}
      <Button onclick={() => (modal = null)}>Cancel</Button>
      <Button variant="primary" onclick={() => (modal = null)}>Save</Button>
    {/snippet}
  </Modal>
{:else if modal === "top"}
  <Modal
    label="Top"
    align="top"
    scrim="frosted"
    onclose={() => (modal = null)}
    width="480px"
    padded
  >
    <p>Pinned near the top, over a frosted scrim: the shape of a picker.</p>
    <Button onclick={(e) => menu.showFor(e.currentTarget, noteMenu())}>A menu over the modal</Button
    >
  </Modal>
{:else if modal === "bare"}
  <Modal label="Pane" title="A pane as a page" bare onclose={() => (modal = null)}>
    <p class="pad">Opaque, edge to edge, no radius: what a phone shows every modal as.</p>
  </Modal>
{/if}

{#if showHelp}
  <ShortcutsOverlay groups={help} onclose={() => (showHelp = false)} />
{/if}

{#if palette === "notes"}
  <CommandPalette
    items={NOTES}
    label="Jump to a note"
    placeholder="Jump to a note…"
    onclose={() => (palette = null)}
    create={(q) => ({
      id: "create",
      label: `Create “${q}”`,
      icon: Plus,
      run: () => toast(`Created ${q}`),
    })}
  >
    {#snippet trailing()}<Kbd hint="⌘K" />{/snippet}
  </CommandPalette>
{:else if palette === "commands"}
  <CommandPalette
    items={COMMANDS}
    label="Run a command"
    placeholder="Run a command…"
    chooseLabel="run"
    onclose={() => (palette = null)}
  >
    {#snippet leading()}<Terminal />{/snippet}
  </CommandPalette>
{/if}

{#if sheetOpen}
  <Sheet label="A sheet" bind:full={sheetFull} onclose={() => (sheetOpen = false)}>
    <div class="sheet-body">
      <p>Drag the grabber or the contents; flick it to the next stop or off the bottom.</p>
      <p class="muted">{sheetFull ? "Full" : "Peeking"}</p>
      <input class="field-input" placeholder="Focusing a field opens it fully" />
    </div>
  </Sheet>
{/if}

{#if lightbox !== null}
  <Lightbox items={MEDIA} bind:index={lightbox} onclose={() => (lightbox = null)}>
    {#snippet actions()}
      <IconButton label="Open in browser" size="lg" onclick={() => toast("Opened")}
        ><ArrowSquareOut /></IconButton
      >
    {/snippet}
  </Lightbox>
{/if}

{#if updater.ready && !updater.dismissed && updater.info}
  <Banner
    icon={ArrowDown}
    title="Purr {updater.info.version} is ready — restart to apply"
    lines={noteSummary(updater.info.notes ?? "")}
    ondismiss={() => updater.dismiss()}
    dismissLabel="Not now"
  >
    {#snippet actions()}
      <Button variant="primary" size="sm" onclick={() => updater.restart()}>Restart</Button>
    {/snippet}
  </Banner>
{/if}

<style>
  .page {
    display: grid;
    gap: calc(var(--sp-5) * 2);
    max-width: 1100px;
  }
  h2 {
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-lg);
    color: var(--color2);
  }
  p {
    margin: 0 0 var(--sp-4);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--gap-4);
    margin-bottom: var(--sp-4);
  }
  .row.top {
    align-items: flex-start;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--sp-5);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--gap-4);
  }
  .target {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    padding: var(--sp-5) calc(var(--sp-5) * 2);
    color: var(--muted);
    border-style: dashed;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .tag-input {
    padding: var(--gap-1) var(--gap-2);
  }
  .tag-input input {
    width: 100%;
  }
  .aligns {
    display: flex;
    gap: var(--gap-2);
  }
  .anchor {
    display: inline-flex;
  }
  .branches {
    display: flex;
    flex-direction: column;
    margin-top: var(--sp-2);
  }
  .box {
    display: flex;
    flex-direction: column;
    height: 260px;
    overflow: hidden;
  }
  .order {
    height: auto;
    padding: var(--sp-2);
  }
  .tall {
    width: 100%;
    height: 100%;
    padding: var(--sp-1) var(--sp-4);
    border-bottom: 1px solid var(--border);
    font-size: var(--fs-sm);
  }
  .panes {
    display: flex;
    width: 560px;
    max-width: 100%;
    height: 160px;
    overflow: hidden;
  }
  aside {
    position: relative;
    flex: none;
    padding: var(--sp-4);
    border-right: 1px solid var(--border);
    background: var(--bg2);
    font-size: var(--fs-sm);
  }
  .main {
    flex: 1;
    display: grid;
    place-items: center;
    font-size: var(--fs-sm);
  }
  .sheet-body {
    padding: var(--sp-4) var(--sp-5);
    overflow-y: auto;
  }
  .pad {
    padding: var(--sp-5);
  }
</style>
