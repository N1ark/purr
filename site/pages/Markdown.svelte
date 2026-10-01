<script lang="ts">
  // Rendered markdown in `.md`, and the four highlighter markups `code.css` colours.
  import { Checkbox } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  const PICTURE =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4ae55"/><stop offset="1" stop-color="#a138bd"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="20" cy="16" r="7" fill="#fff" opacity=".85"/><rect x="9" y="26" width="22" height="14" rx="7" fill="#fff" opacity=".85"/></svg>`,
    );

  let compact = $state(false);
</script>

<PageHeader
  title="Markdown & code"
  description="Wrap rendered markdown in `.md` and it is styled: headings, lists, task lists, quotes, tables, media, mentions. `.md--compact` tightens it for a chat message. `code.css` colours highlight.js, Prism (and legit's flattened Prism) and Pygments markup from the same `--code-*` tokens."
  importLine={`import "purr/styles.css";`}
  source="src/styles/markdown.css"
/>

<Section
  title="Prose"
  description="Everything a renderer emits, in .md. Apps add their own pieces (mentions, wikilinks, embeds) as .md .their-class."
  code={`<div class="md">{@html html}</div>
<div class="md md--compact">{@html message}</div>`}
  block
>
  <div class="toolbar">
    <Checkbox label="Compact, for a chat message" bind:checked={compact} />
    <span class="mono muted">.md{compact ? " .md--compact" : ""}</span>
  </div>
  <div class="md" class:md--compact={compact}>
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
    <h2>Tables, media and disclosures</h2>
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
</Section>

<Section
  title="Code"
  description="The same token colours whichever highlighter produced the markup: highlight.js (.hljs-*), Prism (.token.*), the .t-* runs legit's worker emits, and Pygments' short classes inside .codehilite, as Zulip renders them."
  block
>
  <div class="md">
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
  </div>
</Section>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    margin-bottom: var(--sp-5);
    padding-bottom: var(--sp-4);
    border-bottom: 1px solid var(--border);
    font-size: var(--fs-sm);
  }
  .md {
    max-width: 75ch;
  }
</style>
