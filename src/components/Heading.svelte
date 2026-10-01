<script lang="ts">
  // A heading that links to itself: hover shows a `#` in the margin, and the heading is the
  // link. Without an `id` it takes one from its text once mounted (`uniqueSlug`).
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  import { uniqueSlug } from "../lib/toc";

  interface Props extends Omit<HTMLAttributes<HTMLHeadingElement>, "children"> {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: Snippet;
  }

  const { level, id, children, class: extra, ...rest }: Props = $props();

  let heading = $state<HTMLHeadingElement | null>(null);
  let named = $state<string>();

  $effect(() => {
    // Whatever named it first (a table of contents reading the page) wins.
    if (!id && heading) named = heading.id || uniqueSlug(heading.textContent ?? "");
  });

  const target = $derived(id ?? named);
</script>

<svelte:element
  this={`h${level}`}
  bind:this={heading}
  id={target}
  class={["heading", extra]}
  {...rest}
>
  <a href={target ? `#${target}` : undefined}>{@render children()}</a>
</svelte:element>

<style>
  .heading > a {
    position: relative;
    color: inherit;
    text-decoration: none;
  }
  .heading > a::before {
    content: "#";
    position: absolute;
    left: -1em;
    padding-right: 1em;
    color: var(--faint);
    opacity: 0;
    pointer-events: none;
    -webkit-user-select: none;
    user-select: none;
    transition: opacity var(--dur-slow);
  }
  .heading:target > a::before,
  .heading > a:focus-visible::before {
    opacity: 1;
  }
  @media (hover: hover) {
    .heading > a:hover {
      text-decoration: none;
    }
    .heading > a:hover::before {
      opacity: 1;
    }
  }
</style>
