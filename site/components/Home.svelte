<script lang="ts">
  // The front page: what purr is, how an app takes it in, and every page as a card.
  import { GROUPS, PAGES } from "../pages";
  import { plain } from "../lib/format";
  import { REPO, href } from "../lib/site.svelte";
  import CodeSnippet from "./CodeSnippet.svelte";

  // `purr\/icons` because the purr plugin rewrites that import even inside a string.
  const SETUP = `// vite.config.ts
import { purr } from "purr/vite";
export default defineConfig({ plugins: [purr(), svelte()] });

// main.ts
import "purr/fonts.css";
import "purr/styles.css";

// anywhere
import { Button, toast } from "purr";
import { Gear } from "purr\/icons";`;

  const groups = GROUPS.map((group) => ({
    group,
    pages: PAGES.filter((p) => p.group === group),
  }));
</script>

<header>
  <h1>purr</h1>
  <p class="lead">
    The shared UI layer of <strong>dagobert</strong>, <strong>legit</strong> and
    <strong>Tulip</strong>: Svelte 5 components, actions, small utilities, icons and the styling
    they share. Opinionated on purpose: consistency first, then performance, then reuse.
  </p>
  <p class="muted">
    Every page here renders purr's own source, live: change a component's props and the preview, the
    event log and the snippet follow. The site itself is built from purr. Source on <a href={REPO}
      >GitHub</a
    >.
  </p>
</header>

<section>
  <h2>Using it</h2>
  <CodeSnippet code={SETUP} />
</section>

{#each groups as { group, pages } (group)}
  <section>
    <h2>{group}</h2>
    <div class="cards">
      {#each pages as page (page.slug)}
        <a class="card" href={href(page.slug)}>
          <strong>{page.title}</strong>
          <span class="muted">{plain(page.description)}</span>
        </a>
      {/each}
    </div>
  </section>
{/each}

<style>
  header {
    margin-bottom: calc(var(--sp-5) * 2);
  }
  h1 {
    margin: 0 0 var(--sp-3);
    font-size: calc(var(--fs-xl) * 2);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--theme2);
  }
  .lead {
    max-width: 68ch;
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-lg);
    color: var(--color2);
  }
  p {
    max-width: 75ch;
  }
  section {
    margin-bottom: calc(var(--sp-5) * 2);
  }
  h2 {
    margin: 0 0 var(--sp-4);
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--color2);
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--sp-4);
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    padding: var(--sp-4) var(--sp-5);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg);
    color: var(--color);
    font-size: var(--fs-sm);
    text-decoration: none;
    transition: border-color var(--dur) var(--ease);
  }
  .card strong {
    font-size: var(--fs-base);
    color: var(--color2);
  }
  @media (hover: hover) {
    .card:hover {
      border-color: var(--theme2);
    }
  }
</style>
