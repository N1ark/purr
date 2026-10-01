<script lang="ts">
  // The mark in the text that points at a `Footnote` with the same `id`.
  interface Props {
    /** Shared with the `Footnote`; also the mark shown, unless `mark` is given. */
    id: string;
    mark?: string;
    /** Namespaces the ids, for two documents on one page. */
    prefix?: string;
  }

  const { id, mark, prefix = "fn" }: Props = $props();
</script>

<sup class="fn-ref" id="{prefix}ref-{id}"
  ><a href="#{prefix}-{id}" aria-describedby="{prefix}-{id}">{mark ?? id}</a></sup
>

<style>
  .fn-ref {
    font-size: 0.7em;
    line-height: 0;
  }
  /* A wider target than the digit, without pushing the line apart. */
  a {
    display: inline-block;
    margin: -0.4em;
    padding: 0.4em;
    color: inherit;
    text-decoration: none;
  }
  @media (hover: hover) {
    a:hover {
      color: var(--theme2);
      text-decoration: none;
    }
  }
</style>
