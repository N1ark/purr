<script lang="ts">
  // The front page: what purr is, how to take it in, and every page as a card with a picture.
  import { GROUPS, PAGES } from "../pages";
  import { REPO, href } from "../lib/site.svelte";
  import CodeSnippet from "./CodeSnippet.svelte";
  import Thumb from "./Thumb.svelte";

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

  // Thumbnails render once their card nears the screen.
  let seen = $state<Record<string, boolean>>({});
  let observer: IntersectionObserver | undefined;

  function lazy(node: HTMLElement, slug: string) {
    observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          seen[el.dataset.slug!] = true;
          observer?.unobserve(el);
        }
      },
      { rootMargin: "400px" },
    );
    node.dataset.slug = slug;
    observer.observe(node);
    return { destroy: () => observer?.unobserve(node) };
  }
</script>

<header>
  <h1>purr</h1>
  <p class="lead">
    Svelte 5 components, actions, utilities, icons and styles. Every page renders the live source;
    code on <a href={REPO}>GitHub</a>.
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
        <a class="card" href={href(page.slug)} use:lazy={page.slug}>
          <div class="thumb">
            {#if seen[page.slug]}<Thumb {page} />{/if}
          </div>
          <span class="name">{page.title}</span>
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
    margin: 0;
    font-size: var(--fs-lg);
    color: var(--color2);
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
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: var(--sp-4);
  }
  .card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--bg);
    color: var(--color2);
    text-decoration: none;
    transition: border-color var(--dur) var(--ease);
  }
  .thumb {
    height: 100px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }
  .name {
    padding: var(--sp-3) var(--sp-4);
    background: var(--bg2);
    font-size: var(--fs-sm);
    font-weight: 550;
  }
  @media (max-width: 600px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (hover: hover) {
    .card:hover {
      border-color: var(--theme2);
    }
  }
</style>
