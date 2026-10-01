<script lang="ts">
  import { Heading, TableOfContents, headingsIn, type TocItem } from "purr";

  let article = $state<HTMLElement | null>(null);
  let items = $state<TocItem[]>([]);

  // Read once the headings have named themselves.
  $effect(() => {
    if (article) requestAnimationFrame(() => (items = headingsIn(article!)));
  });
</script>

<div class="s-row top demo">
  <article class="md" bind:this={article}>
    <Heading level={2}>Read off the page</Heading>
    <p><code>headingsIn</code> collects these headings and gives each an id.</p>
    <Heading level={3}>Nested</Heading>
    <p>A deeper level steps in.</p>
    <Heading level={3}>Été indien</Heading>
    <p>Accents fold into the anchor.</p>
    <Heading level={2}>Back out</Heading>
  </article>
  <TableOfContents {items} title="On this page" />
</div>

<style>
  .demo {
    gap: var(--sp-5);
  }
  article {
    flex: 1;
    min-width: 200px;
    padding-left: 1em;
  }
</style>
