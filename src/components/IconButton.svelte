<script lang="ts">
  // A square button holding one icon. `label` is its accessible name and its tooltip, since
  // these never carry visible text. The icon inherits the glyph size, so it needs no `size`.
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { tooltip, type TooltipSource } from "../actions/tooltip";

  interface Props extends Omit<HTMLButtonAttributes, "children"> {
    label: string;
    /** `sm` inline in a row, `md` panel chrome, `lg` toolbars (`--btn`, 44px on touch). */
    size?: "sm" | "md" | "lg";
    /** `ghost` has no chrome until hovered; `default` is a bordered `.btn`. */
    variant?: "ghost" | "default";
    /** Hover turns it red: delete, remove, discard. */
    danger?: boolean;
    /** A toggle's state, as `aria-pressed`. */
    pressed?: boolean;
    /** A shortcut shown in the tooltip after the label, in `keys` notation ("Mod+K"). */
    shortcut?: string;
    /** Tooltip when it differs from the label: text, `{ text, hint }` or a function; `false` for none. */
    tip?: TooltipSource;
    disabled?: boolean;
    onclick?: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
    children: Snippet;
  }

  let {
    label,
    size = "md",
    variant = "ghost",
    danger = false,
    pressed,
    shortcut,
    tip,
    disabled = false,
    onclick,
    type = "button",
    class: extra,
    children,
    ...rest
  }: Props = $props();
</script>

<button
  {type}
  class={[
    "btn btn--icon",
    variant === "ghost" && "btn--ghost",
    danger && "btn--danger",
    size !== "md" && `btn--${size}`,
    extra,
  ]}
  aria-label={label}
  aria-pressed={pressed}
  {disabled}
  {onclick}
  use:tooltip={tip === undefined ? { text: label, hint: shortcut } : tip}
  {...rest}
>
  {@render children()}
</button>
