<script lang="ts">
  // A few overlapping avatars and a "+N" for the rest; the first sits on top.
  import Avatar from "./Avatar.svelte";

  interface Person {
    name: string;
    src?: string | null;
    seed?: number | string;
  }

  interface Props {
    people: Person[];
    /** Pixels; unset follows `--avatar`. */
    size?: number;
    max?: number;
    round?: boolean;
    /** Hover text; defaults to every name, comma-separated. */
    title?: string;
  }

  const { people, size, max = 3, round = false, title }: Props = $props();

  const shown = $derived(people.slice(0, max));
  const extra = $derived(people.length - shown.length);
  // Reversed, so that painting order (later on top) puts the first person on top.
  const reversed = $derived([...shown].reverse());
</script>

<span
  class="stack"
  style:--avatar-size={size === undefined ? undefined : `${size}px`}
  title={title ?? people.map((p) => p.name).join(", ")}
>
  {#if extra > 0}
    <span class="slot more" class:round>+{extra}</span>
  {/if}
  {#each reversed as person, i (i)}
    <span class="slot">
      <Avatar name={person.name} src={person.src} seed={person.seed} {size} {round} ring title="" />
    </span>
  {/each}
</span>

<style>
  .stack {
    --avatar-size-used: var(--avatar-size, var(--avatar));
    display: inline-flex;
    flex-direction: row-reverse;
    flex: none;
    isolation: isolate;
    vertical-align: top;
  }
  .slot {
    display: grid;
  }
  .slot:not(:last-child) {
    margin-left: calc(var(--avatar-size-used) / -3);
  }
  .more {
    place-items: center;
    width: var(--avatar-size-used);
    height: var(--avatar-size-used);
    border-radius: max(var(--radius-sm), calc(var(--avatar-size-used) * 0.18));
    background: var(--bg3);
    box-shadow: 0 0 0 1.5px var(--ring-bg, var(--bg2));
    font-size: max(var(--fs-nano), calc(var(--avatar-size-used) * 0.38));
    font-weight: 600;
    color: var(--muted);
  }
  .more.round {
    border-radius: 50%;
  }
</style>
