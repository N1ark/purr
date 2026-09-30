<script lang="ts">
  import {
    Avatar,
    AvatarStack,
    Badge,
    Button,
    Checkbox,
    Chip,
    ColorGrid,
    ConfirmButton,
    EmptyState,
    Field,
    IconButton,
    LiveRegion,
    PanelHeader,
    PresenceDot,
    ProgressRing,
    SearchInput,
    Segmented,
    SettingGroup,
    SettingRow,
    Spinner,
    Switch,
    Tag,
    TextArea,
    TextField,
    Twisty,
  } from "purr";
  import {
    ArrowsClockwise,
    Bell,
    DistributeHorizontal,
    DistributeVertical,
    Funnel,
    Gear,
    GitMerge,
    GitPullRequest,
    GitPullRequestClosed,
    GitPullRequestUnknown,
    Hash,
    IssueOpened,
    MagnifyingGlass,
    PencilSimple,
    Plus,
    PushPin,
    SidebarSimple,
    Star,
    Trash,
    Tray,
    X,
  } from "purr/icons";

  const WEIGHTS = ["thin", "light", "regular", "bold", "fill", "duotone"] as const;
  const CUSTOM = [
    GitPullRequestClosed,
    GitPullRequestUnknown,
    IssueOpened,
    DistributeHorizontal,
    DistributeVertical,
  ];
  // Dagobert's tag palette and a slice of Tulip's channel colours.
  const TAGS = ["#b045ab", "#c678dd", "#61afef", "#56b6c2", "#98c379", "#e5c07b", "#d19a66"];
  const CHANNELS = ["#76ce90", "#fae589", "#a6c7e5", "#e79ab5", "#bfd56f", "#f4ae55", "#b0a5fd"];
  const PICTURE =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4ae55"/><stop offset="1" stop-color="#a138bd"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="20" cy="16" r="7" fill="#fff" opacity=".85"/><rect x="9" y="26" width="22" height="14" rx="7" fill="#fff" opacity=".85"/></svg>`,
    );
  const PEOPLE = [
    { name: "Ada Lovelace", seed: 1 },
    { name: "Grace Hopper", seed: 2, src: PICTURE },
    { name: "Linus", seed: 3 },
    { name: "Margaret Hamilton", seed: 4 },
    { name: "Edsger Dijkstra", seed: 5 },
  ];

  let loading = $state(false);
  let pressed = $state(true);
  let confirmed = $state(0);
  let name = $state("Dagobert");
  let email = $state("not-an-email");
  let message = $state("Fix the thing\n\nIt was broken.");
  let search = $state("");
  let filter = $state("wiki");
  let unread = $state(true);
  let archived = $state(false);
  let view = $state<"list" | "grid" | "board">("list");
  let notify = $state(true);
  let sound = $state(false);
  let check = $state(true);
  let mixed = $state(true);
  let tags = $state(["design", "urgent", "later"]);
  let open = $state(false);
  let tagColor = $state<string | null>("#61afef");
  let channelColor = $state<string | null>(CHANNELS[2]);
  let compact = $state(false);
  let announce = $state({ text: "", seq: 0 });
  let progress = $state(3);

  function toggleLoading() {
    loading = true;
    setTimeout(() => (loading = false), 1500);
  }
</script>

<div class="page">
  <section>
    <h2>Buttons</h2>
    <div class="row">
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
      <Button disabled>Disabled</Button>
      <Button variant="primary" {loading} onclick={toggleLoading}>
        {loading ? "Saving…" : "Save"}
      </Button>
      <Button {pressed} onclick={() => (pressed = !pressed)}><PushPin /> Pinned</Button>
    </div>
    <div class="row">
      <Button size="sm"><Plus weight="bold" /> Small</Button>
      <Button>Medium</Button>
      <Button size="lg" variant="primary">Large</Button>
      <ConfirmButton confirmLabel="Click to confirm" onconfirm={() => confirmed++}>
        <Trash /> Delete ({confirmed})
      </ConfirmButton>
      <ConfirmButton variant="default" confirmLabel="Force push?" onconfirm={() => confirmed++}>
        Force push
      </ConfirmButton>
      <button class="btn btn--ghost">Class only: <kbd>⌘K</kbd></button>
    </div>
    <div class="row">
      <IconButton label="Small" size="sm"><X /></IconButton>
      <IconButton label="Settings"><Gear /></IconButton>
      <IconButton label="Refresh" size="lg" shortcut="Mod+R"><ArrowsClockwise /></IconButton>
      <IconButton label="Pinned" {pressed} onclick={() => (pressed = !pressed)}>
        <PushPin weight={pressed ? "fill" : "regular"} />
      </IconButton>
      <IconButton label="Delete" danger><Trash /></IconButton>
      <IconButton label="Bordered" variant="default"><PencilSimple /></IconButton>
      <IconButton label="Bordered, large" variant="default" size="lg"><Bell /></IconButton>
      <IconButton label="Disabled" disabled><Star /></IconButton>
      <IconButton label="Panel" size="lg"><SidebarSimple mirrored /></IconButton>
    </div>
  </section>

  <section>
    <h2>Fields</h2>
    <div class="grid">
      <TextField label="Name" bind:value={name} hint="What the window title shows." />
      <TextField
        label="Email"
        type="email"
        bind:value={email}
        error={email.includes("@") ? undefined : "That is not an email address."}
      />
      <TextArea label="Commit message" mono bind:value={message} rows={3} />
      <Field label="Plain select, as `.field-input`">
        <select class="field-input">
          <option>Everyone</option>
          <option>Only me</option>
        </select>
      </Field>
    </div>
    <div class="stack surface">
      <SearchInput
        label="Filter channels"
        placeholder="Filter channels"
        bind:value={search}
        clearable
      >
        {#snippet trailing()}
          <IconButton
            label="Only unread"
            size="sm"
            pressed={unread}
            onclick={() => (unread = !unread)}
          >
            <Funnel />
          </IconButton>
        {/snippet}
      </SearchInput>
      <div class="pad row">
        <SearchInput
          variant="field"
          label="Search"
          placeholder="Search notes…"
          bind:value={filter}
          clearable
        />
      </div>
    </div>
  </section>

  <section>
    <h2>Toggles</h2>
    <div class="row">
      <Switch label="Notifications" bind:checked={notify} />
      <Switch label="Sound" bind:checked={sound} />
      <Switch label="Disabled" checked={false} disabled />
      <Checkbox bind:checked={check} label="Checked" />
      <Checkbox bind:checked={mixed} indeterminate label="Mixed" />
      <Checkbox checked={false} label="With a hint" hint="A second line explains it." />
      <Checkbox checked aria-label="Bare checkbox" />
      <button class="checkbox is-on" aria-label="A drawn check on a button"></button>
    </div>
    <div class="row">
      <Chip label="Unread" on={unread} onclick={() => (unread = !unread)} />
      <Chip label="Archived" on={archived} onclick={() => (archived = !archived)} />
      <Chip on={false}><Star /> Starred <Badge count={4} tone="soft" /></Chip>
      <Segmented
        label="View"
        bind:value={view}
        options={[
          { id: "list", label: "List" },
          { id: "grid", label: "Grid" },
          { id: "board", label: "Board", disabled: true },
        ]}
      />
      <Segmented
        label="Size"
        size="sm"
        bind:value={view}
        options={[
          { id: "list", label: "List", icon: Tray },
          { id: "grid", label: "Grid", icon: Hash },
        ]}
      />
    </div>
  </section>

  <section>
    <h2>Labels</h2>
    <div class="row">
      <Badge count={3} />
      <Badge count={42} tone="danger" />
      <Badge count={7} tone="soft" />
      <Badge count={1200} />
      <Badge count={50} partial />
      <Tag label="neutral" />
      <Tag label="bot" caps />
      <Tag label="you" caps color="var(--theme2)" />
      {#each tags as tag, i (tag)}
        <Tag
          label={tag}
          color={TAGS[(i * 2) % TAGS.length]}
          onclick={() => {}}
          onremove={() => (tags = tags.filter((t) => t !== tag))}
        />
      {/each}
      <span class="tag" style:--tag="var(--success)">class only</span>
      <kbd>⌘</kbd><kbd>K</kbd>
    </div>
  </section>

  <section>
    <h2>Status</h2>
    <div class="row">
      <Spinner />
      <Spinner size={16} />
      <Spinner size={24} label="Syncing" />
      <span class="spin"><ArrowsClockwise /></span>
      <ProgressRing value={0} max={0} label="Nothing tracked" />
      <ProgressRing value={progress} max={5} label="{progress} of 5 done" />
      <ProgressRing value={5} max={5} size={20} label="All done" />
      <Button size="sm" onclick={() => (progress = (progress + 1) % 6)}>Step</Button>
      <PresenceDot state="active" label="Active" />
      <PresenceDot state="idle" label="Idle" />
      <PresenceDot state="offline" />
      <button class="btn btn--ghost" onclick={() => (open = !open)}>
        <Twisty {open} /> Disclosure
      </button>
    </div>
  </section>

  <section>
    <h2>People</h2>
    <div class="row">
      {#each PEOPLE as p (p.seed)}
        <Avatar name={p.name} seed={p.seed} src={p.src} />
      {/each}
      <Avatar name="Broken Picture" src="/does-not-exist.png" size={28} />
      <Avatar
        name="Grace Hopper"
        seed={2}
        src={PICTURE}
        size={32}
        round
        presence="active"
        presenceLabel="Active"
      />
      <Avatar name="Idle Person" seed={9} size={32} round presence="idle" />
      <Avatar name="someone@example.com" seed="someone@example.com" size={40} round />
      <AvatarStack people={PEOPLE} />
      <AvatarStack people={PEOPLE.slice(0, 2)} size={24} round />
    </div>
  </section>

  <section>
    <h2>Rows and surfaces</h2>
    <div class="grid">
      <div class="surface pad list" style:--ring-bg="var(--surface)">
        <button class="row-item"><Hash /> <span class="truncate">general</span></button>
        <button class="row-item is-current" aria-current="page"
          ><Hash /> <span class="truncate">design</span> <Badge count={3} /></button
        >
        <button class="row-item is-cursor"
          ><Hash />
          <span class="truncate">a channel with a name long enough to truncate</span></button
        >
        <div class="row-item">
          <Avatar name="Ada Lovelace" seed={1} size={16} presence="active" />
          <span class="truncate fills">Ada Lovelace</span>
          <Tag label="bot" caps />
        </div>
      </div>
      <div class="surface">
        <PanelHeader title="Pull requests" icon={GitPullRequest} count={12} onclose={() => {}}>
          {#snippet actions()}
            <IconButton label="Refresh"><ArrowsClockwise /></IconButton>
          {/snippet}
        </PanelHeader>
        <EmptyState icon={MagnifyingGlass} text="Nothing matches" hint="Try a shorter filter.">
          {#snippet action()}
            <Button size="sm" onclick={() => (filter = "")}>Clear filter</Button>
          {/snippet}
        </EmptyState>
        <EmptyState inline text="No topics yet" />
      </div>
      <div class="surface pad">
        <SettingGroup
          title="Notifications"
          note="Desktop notifications also need the system's permission."
        >
          <SettingRow label="Notify me" sub="For direct messages and mentions.">
            <Switch label="Notify me" bind:checked={notify} />
          </SettingRow>
          <SettingRow label="Play a sound" disabled={!notify}>
            <Switch label="Play a sound" bind:checked={sound} disabled={!notify} />
          </SettingRow>
        </SettingGroup>
        <SettingGroup title="Appearance">
          <SettingRow label="Layout" stack>
            <Segmented
              label="Layout"
              bind:value={view}
              options={[
                { id: "list", label: "List" },
                { id: "grid", label: "Grid" },
              ]}
            />
          </SettingRow>
        </SettingGroup>
      </div>
      <div class="surface pad">
        <p class="muted">
          A <span class="hoverable">hoverable</span> span, <span class="mono">mono text</span> and a rule:
        </p>
        <div class="row"><span class="faint">Section</span><span class="rule"></span></div>
        <Button
          size="sm"
          onclick={() =>
            (announce = {
              text: `Announced at ${new Date().toLocaleTimeString()}`,
              seq: announce.seq + 1,
            })}
        >
          Announce (screen readers only)
        </Button>
        <LiveRegion text={announce.text} seq={announce.seq} />
        <p class="sr-only">Only a screen reader sees this.</p>
      </div>
    </div>
  </section>

  <section>
    <h2>Colours</h2>
    <div class="row top">
      <div class="surface pad">
        <ColorGrid
          label="Tag colour"
          colors={TAGS}
          columns={5}
          value={tagColor}
          auto
          custom
          onpick={(c) => (tagColor = c)}
          oncustominput={(c) => (tagColor = c)}
        />
        <p class="muted small">
          Picked: {tagColor ?? "automatic"} <span class="swatch" style:--c={tagColor}></span>
        </p>
      </div>
      <div class="surface pad">
        <ColorGrid
          label="Channel colour"
          colors={CHANNELS}
          shape="square"
          value={channelColor}
          custom
          onpick={(c) => (channelColor = c)}
        />
      </div>
    </div>
  </section>

  <section>
    <h2>Icons</h2>
    <table class="icons">
      <tbody>
        {#each CUSTOM as Icon, i (i)}
          <tr>
            {#each WEIGHTS as weight (weight)}
              <td title={weight}><Icon size={22} {weight} /></td>
            {/each}
          </tr>
        {/each}
        <tr>
          {#each [GitPullRequest, GitMerge, Gear, Bell, Star, Trash] as Icon, i (i)}
            <td><Icon size={22} /></td>
          {/each}
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>
      Markdown
      <label class="inline-check"
        ><input type="checkbox" class="checkbox" bind:checked={compact} />
        <code>.md--compact</code></label
      >
    </h2>
    <div class="surface pad md" class:md--compact={compact}>
      <h1>Heading one</h1>
      <p>
        Body text with <strong>bold</strong>, <em>emphasis</em>, <a href="#top">a link</a>,
        <code>inline code</code>, <kbd>⌘</kbd><kbd>K</kbd>, a
        <span class="mention">@Ada Lovelace</span>, a <span class="mention is-self">@you</span>,
        <mark>a highlight</mark>
        and a
        <time>Tue 14:30</time>. A long URL wraps anywhere:
        https://example.com/user_uploads/2/ab/cdefghijklmnopqrstuvwxyz0123456789/a-very-long-file-name.png
      </p>
      <h2>Heading two</h2>
      <ul>
        <li>A bullet</li>
        <li>
          Nested
          <ul>
            <li>deeper</li>
          </ul>
        </li>
        <li><input type="checkbox" checked disabled /> A done task</li>
        <li><input type="checkbox" disabled /> An open task</li>
      </ul>
      <ol>
        <li>First</li>
        <li>Second</li>
      </ol>
      <blockquote><p>A quotation, in the muted colour with a rule beside it.</p></blockquote>
      <h3>highlight.js</h3>
      <pre><code class="hljs language-ts"
          ><span class="hljs-comment">// A comment</span>
<span class="hljs-keyword">export</span> <span class="hljs-keyword">function</span> <span
            class="hljs-title function_">greet</span
          >(<span class="hljs-params">name: <span class="hljs-built_in">string</span></span>): <span
            class="hljs-built_in">string</span
          > {"{"}
  <span class="hljs-keyword">const</span> count = <span class="hljs-number">42</span>;
  <span class="hljs-keyword">return</span> <span class="hljs-string"
            >`Hello, <span class="hljs-subst">${"{"}name{"}"}</span>`</span
          >;
{"}"}</code
        ></pre>
      <h3>Prism</h3>
      <pre><code class="language-js"
          ><span class="token comment">/* Prism's own classes */</span>
<span class="token keyword">class</span> <span class="token class-name">Queue</span> <span
            class="token punctuation">{"{"}</span
          >
  <span class="token function">push</span><span class="token punctuation">(</span>item<span
            class="token punctuation">)</span
          > <span class="token punctuation">{"{"}</span> <span class="token keyword">return</span
          > <span class="token keyword">this</span><span class="token punctuation">.</span><span
            class="token property">items</span
          ><span class="token punctuation">.</span><span class="token function">push</span><span
            class="token punctuation">(</span
          >item<span class="token punctuation">)</span> <span class="token operator">||</span> <span
            class="token boolean">true</span
          ><span class="token punctuation">;</span> <span class="token punctuation">{"}"}</span>
<span class="token punctuation">{"}"}</span></code
        ></pre>
      <h3>Prism, as legit's worker flattens it</h3>
      <pre><code
          ><span class="t-keyword">fn</span> <span class="t-function">main</span><span
            class="t-punctuation">()</span
          > <span class="t-punctuation">{"{"}</span>
    <span class="t-keyword">let</span> answer<span class="t-punctuation">:</span> <span
            class="t-builtin">u32</span
          > <span class="t-operator">=</span> <span class="t-number">42</span><span
            class="t-punctuation">;</span
          > <span class="t-comment">// the answer</span>
    <span class="t-macro t-property">println!</span><span class="t-punctuation">(</span><span
            class="t-string">"{"{"}answer{"}"}"</span
          ><span class="t-punctuation">);</span>
<span class="t-punctuation">{"}"}</span></code
        ></pre>
      <h3>Pygments, as Zulip renders it</h3>
      <div class="codehilite" data-code-language="Python">
        <div class="code-head">
          <span class="code-lang">python</span><button class="code-copy">Copy</button>
        </div>
        <pre><span></span><code
            ><span class="kn">from</span> <span class="nn">math</span> <span class="kn">import</span
            > <span class="n">tau</span>
<span class="nd">@cache</span>
<span class="k">def</span> <span class="nf">area</span><span class="p">(</span><span class="n"
              >r</span
            ><span class="p">:</span> <span class="nb">float</span><span class="p">)</span> <span
              class="o">-&gt;</span
            > <span class="nb">float</span><span class="p">:</span>
    <span class="sd">"""Half of tau r squared."""</span>
    <span class="k">return</span> <span class="n">tau</span> <span class="o">*</span> <span
              class="n">r</span
            > <span class="o">**</span> <span class="mi">2</span> <span class="o">/</span> <span
              class="mi">2</span
            >  <span class="c1"># ok</span>
</code></pre>
      </div>
      <h3>Tables, media and disclosures</h3>
      <table>
        <thead><tr><th>Token</th><th>Use</th></tr></thead>
        <tbody>
          <tr><td><code>--theme</code></td><td>Accent fill</td></tr>
          <tr><td><code>--muted</code></td><td>Secondary text</td></tr>
        </tbody>
      </table>
      <img src={PICTURE} alt="A gradient placeholder" width="120" height="120" />
      <details>
        <summary>A spoiler</summary>
        <p>Revealed.</p>
      </details>
      <hr />
      <p>The end.</p>
    </div>
  </section>
</div>

<style>
  .page {
    display: grid;
    gap: calc(var(--sp-5) * 2);
    max-width: 1100px;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-lg);
    color: var(--color2);
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
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--sp-5);
    margin-bottom: var(--sp-4);
  }
  .stack {
    display: flex;
    flex-direction: column;
    max-width: 420px;
  }
  .pad {
    padding: var(--sp-4);
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-1);
  }
  .small {
    font-size: var(--fs-xs);
  }
  .inline-check {
    display: inline-flex;
    align-items: center;
    gap: var(--gap-3);
    font-size: var(--fs-sm);
    font-weight: 400;
  }
  .icons td {
    padding: var(--sp-2) var(--sp-3);
    color: var(--color2);
  }
</style>
