<script lang="ts">
  // A person's picture, or their initials on a colour from `seed` when there is none or it
  // fails to load. Omit `size` in a long list and let `--avatar` (density) size it: reading a
  // token back per row would force a style recalculation. Rendered once per row: keep it bare.
  import { colorFromSeed, hashString, initials } from "../lib/color";
  import PresenceDot, { type Presence } from "./PresenceDot.svelte";

  interface Props {
    name: string;
    src?: string | null;
    /** What the colour derives from: a user id, or an email. Defaults to `name`. */
    seed?: number | string;
    /** Pixels; unset follows `--avatar`. */
    size?: number;
    round?: boolean;
    /** Cuts it out of what is behind it, for stacks; the surface sets `--ring-bg`. */
    ring?: boolean;
    presence?: Presence | null;
    presenceLabel?: string;
    /** Hover text; defaults to `name`, `""` for none. */
    title?: string;
  }

  const {
    name,
    src,
    seed,
    size,
    round = false,
    ring = false,
    presence,
    presenceLabel,
    title,
  }: Props = $props();

  let failed = $state<string | null>(null);
  const showImage = $derived(!!src && src !== failed);
  const key = $derived(seed ?? name.trim().toLowerCase());
  const background = $derived(colorFromSeed(typeof key === "number" ? key : hashString(key)));
</script>

<!-- The dot sits outside the picture's clip, hence the holder. -->
<span
  class="holder"
  style:--avatar-size={size === undefined ? undefined : `${size}px`}
  title={title ?? name}
>
  <span class="avatar" class:round class:ring style:background={showImage ? undefined : background}>
    {#if showImage}
      <!-- Lazy: a long scrollback would otherwise fire hundreds of requests. -->
      <img
        src={src ?? undefined}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onerror={() => (failed = src ?? null)}
      />
    {:else}
      {initials(name)}
    {/if}
  </span>
  {#if presence && presence !== "offline"}
    <span class="dot">
      <PresenceDot
        state={presence}
        label={presenceLabel}
        size={Math.max(6, Math.round((size ?? 22) * 0.32))}
      />
    </span>
  {/if}
</span>

<style>
  .holder {
    --avatar-size-used: var(--avatar-size, var(--avatar));
    position: relative;
    display: inline-grid;
    flex: none;
    width: var(--avatar-size-used);
    height: var(--avatar-size-used);
    /* A grid takes its baseline from its content, so a picture and initials would sit apart. */
    vertical-align: top;
  }
  .avatar {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: max(var(--radius-sm), calc(var(--avatar-size-used) * 0.18));
    background: var(--bg3);
    font-size: max(var(--fs-nano), calc(var(--avatar-size-used) * 0.42));
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--on-accent);
    user-select: none;
  }
  .round {
    border-radius: 50%;
  }
  .ring {
    box-shadow: 0 0 0 1.5px var(--ring-bg, var(--bg2));
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .dot {
    position: absolute;
    right: -1px;
    bottom: -1px;
    display: grid;
  }
</style>
