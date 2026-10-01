<script lang="ts">
  // Renders a `MenuEntry[]`: a popover on the desktop, an action sheet on a phone. Arrows walk it,
  // → and ← go in and out of submenus, typing a letter jumps to the entry it starts, and hovering
  // moves the same cursor the keyboard does.
  import CaretRightIcon from "phosphor-svelte/lib/CaretRightIcon";
  import CheckIcon from "phosphor-svelte/lib/CheckIcon";
  import MinusIcon from "phosphor-svelte/lib/MinusIcon";
  import PlusIcon from "phosphor-svelte/lib/PlusIcon";
  import { tick } from "svelte";

  import { isItem, type MenuAnchor, type MenuEntry, type MenuItem } from "../lib/menu.svelte";
  import { usingKeyboard } from "../lib/modality";
  import { isMobileLayout } from "../lib/platform";
  import type { Placement } from "../lib/position";
  import ActionSheet from "./ActionSheet.svelte";
  import Kbd from "./Kbd.svelte";
  import Popover from "./Popover.svelte";

  interface Props {
    entries: MenuEntry[];
    /** Where it opens: the event's point, or the element it hangs off. */
    anchor: MenuAnchor;
    placement?: Placement;
    onclose: () => void;
    /** A small heading over the entries, e.g. the author of the message it acts on. */
    title?: string | null;
    /** Announced to screen readers; the title, or this. */
    label?: string;
    /** An action sheet rather than a popover; on `body.mobile` by default. */
    sheet?: boolean;
    dismissLabel?: string;
    /** Names a colour grid's custom picker when the entry does not. */
    customColorLabel?: string;
    minWidth?: string;
    maxWidth?: string;
  }

  const {
    entries,
    anchor,
    placement,
    onclose,
    title = null,
    label = "Menu",
    sheet = isMobileLayout(),
    dismissLabel = "Dismiss",
    customColorLabel = "Any colour",
    minWidth = "180px",
    maxWidth = "300px",
  }: Props = $props();

  let root = $state<HTMLElement | null>(null);
  let actionSheet = $state<ActionSheet | null>(null);
  /** The open submenu at each depth, by index in its level. */
  let openPath = $state<number[]>([]);
  /** The entry waiting for its confirming second press, by path. */
  let armed = $state<string | null>(null);

  const control = { close };

  function close() {
    if (sheet) actionSheet?.dismiss();
    else onclose();
  }

  function activate(entry: MenuItem, depth: number, index: number, path: string) {
    if (entry.disabled) return;
    if (entry.items?.length) {
      void openSubmenu(depth, index, true);
      return;
    }
    if (entry.confirm && armed !== path) {
      armed = path;
      return;
    }
    if (entry.keepOpen) {
      entry.run?.();
      return;
    }
    // Closed first: whatever it runs may open a dialog or a menu of its own.
    close();
    entry.run?.();
  }

  async function openSubmenu(depth: number, index: number, focusFirst: boolean) {
    openPath = [...openPath.slice(0, depth), index];
    if (!focusFirst) return;
    await tick();
    const level = root?.querySelector<HTMLElement>(`[data-menu-level="${depth + 1}"]`);
    if (level) itemsOf(level)[0]?.focus();
  }

  function hover(e: PointerEvent, entry: MenuItem, depth: number, index: number) {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget as HTMLElement;
    if (document.activeElement !== el) el.focus({ preventScroll: true });
    if (entry.items?.length) {
      if (openPath[depth] !== index) openPath = [...openPath.slice(0, depth), index];
    } else if (openPath.length > depth) {
      openPath = openPath.slice(0, depth);
    }
  }

  const ITEM = '[role^="menuitem"]:not([aria-disabled="true"])';

  function itemsOf(level: Element): HTMLElement[] {
    return [...level.querySelectorAll<HTMLElement>(ITEM)].filter(
      (el) => el.closest("[data-menu-level]") === level,
    );
  }

  let typed = "";
  let typedAt = 0;

  function onKeydown(e: KeyboardEvent) {
    const active = document.activeElement as HTMLElement | null;
    const level =
      active?.closest<HTMLElement>("[data-menu-level]") ??
      root?.querySelector<HTMLElement>('[data-menu-level="0"]');
    if (!level) return;
    const depth = Number(level.dataset.menuLevel);
    const all = itemsOf(level);
    const at = active ? all.indexOf(active) : -1;
    // A field in a custom entry keeps its own editing keys.
    const inField = !!active?.matches("input, textarea");
    if (inField && !["ArrowDown", "ArrowUp", "Tab", "Escape"].includes(e.key)) return;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!all.length) return;
        const step = e.key === "ArrowDown" ? 1 : -1;
        const next =
          at < 0 ? (step > 0 ? 0 : all.length - 1) : (at + step + all.length) % all.length;
        all[next].focus();
        return;
      }
      case "Home":
      case "End":
        e.preventDefault();
        all[e.key === "Home" ? 0 : all.length - 1]?.focus();
        return;
      case "ArrowRight": {
        const index = Number(active?.dataset.menuIndex);
        if (active?.getAttribute("aria-haspopup") === "menu" && Number.isFinite(index)) {
          e.preventDefault();
          void openSubmenu(depth, index, true);
        }
        return;
      }
      case "ArrowLeft":
      case "Escape":
        if (depth === 0) return;
        // Out of the submenu only; the overlay stack would close the whole menu.
        e.preventDefault();
        e.stopPropagation();
        openPath = openPath.slice(0, depth - 1);
        level.parentElement
          ?.closest(".row")
          ?.querySelector<HTMLElement>(":scope > button")
          ?.focus();
        return;
      case "Tab":
        e.preventDefault();
        close();
        return;
    }

    // Type-ahead: letters typed in quick succession jump to the entry they start.
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey || e.key === " ") return;
    typed = e.timeStamp - typedAt > 600 ? e.key.toLowerCase() : typed + e.key.toLowerCase();
    typedAt = e.timeStamp;
    const labelOf = (el: HTMLElement) =>
      (el.querySelector(".label")?.textContent ?? el.textContent ?? "").trim().toLowerCase();
    const from = typed.length === 1 ? at + 1 : Math.max(0, at);
    const ordered = [...all.slice(from), ...all.slice(0, from)];
    ordered.find((el) => labelOf(el).startsWith(typed))?.focus();
  }

  $effect(() => {
    if (!sheet) return;
    // The popover focuses its first entry itself; the sheet's is done here, from the keyboard only.
    const frame = requestAnimationFrame(() => {
      const first = root?.querySelector<HTMLElement>('[data-menu-level="0"]');
      if (first && usingKeyboard()) itemsOf(first)[0]?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  });

  /** Fixed beside its row, since the menu scrolls and would clip it; flips left where the window ends. */
  function fit(node: HTMLElement) {
    const row = node.parentElement?.getBoundingClientRect();
    if (!row) return;
    const { width, height } = node.getBoundingClientRect();
    const gap = 4;
    let x = row.right + gap;
    if (x + width > window.innerWidth - 8) x = Math.max(8, row.left - gap - width);
    const y = Math.max(8, Math.min(row.top - gap, window.innerHeight - 8 - height));
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  }

  const has = (list: MenuEntry[], test: (item: MenuItem) => boolean) =>
    list.some((e) => isItem(e) && test(e));
</script>

<!-- No gutter is reserved for checks: one sits in the icon slot when the item has no icon, else after the label. -->
{#snippet mark(item: MenuItem)}
  {#if item.checked}
    <span class="mark" class:mixed={item.checked === "mixed"}>
      {#if item.checked === "mixed"}<MinusIcon weight="bold" />{:else}<CheckIcon
          weight="bold"
        />{/if}
    </span>
  {/if}
{/snippet}

{#snippet level(list: MenuEntry[], depth: number, prefix: string)}
  {@const icons = has(list, (item) => !!item.icon || !!item.swatch)}
  <div class="level" data-menu-level={depth} role="none">
    {#each list as entry, i (i)}
      {#if entry === "separator"}
        <div class="sep" role="separator"></div>
      {:else if !isItem(entry) && entry.kind === "heading"}
        <div class="heading truncate" role="presentation">{entry.label}</div>
      {:else if !isItem(entry) && entry.kind === "colors"}
        {@const colors = entry}
        <div class="colors" role="group" aria-label={colors.label}>
          {#each colors.colors as color (color)}
            <button
              type="button"
              class="swatch"
              role="menuitemradio"
              aria-checked={color.toLowerCase() === colors.selected?.toLowerCase()}
              aria-label={color}
              style:--c={color}
              onclick={() => {
                close();
                colors.pick(color);
              }}
            ></button>
          {/each}
          {#if colors.custom}
            <label class="swatch custom" aria-label={colors.customLabel ?? customColorLabel}>
              <PlusIcon weight="bold" />
              <input
                type="color"
                value={colors.selected ?? colors.colors[0] ?? "#000000"}
                onchange={(e) => {
                  const value = e.currentTarget.value;
                  close();
                  colors.custom?.(value);
                }}
              />
            </label>
          {/if}
        </div>
      {:else if !isItem(entry) && entry.kind === "custom"}
        <div class="custom-entry" role="none">{@render entry.render(control)}</div>
      {:else if isItem(entry)}
        {@const item = entry}
        {@const path = `${prefix}${i}`}
        {@const sub = !!item.items?.length}
        {@const expanded = sub && openPath[depth] === i}
        {@const decorated = !!item.icon || !!item.swatch}
        <div class="row" role="none">
          <button
            type="button"
            class="item"
            class:danger={item.danger}
            class:armed={armed === path}
            role={item.checked !== undefined ? "menuitemcheckbox" : "menuitem"}
            aria-checked={item.checked === undefined
              ? undefined
              : item.checked === "mixed"
                ? "mixed"
                : item.checked}
            aria-disabled={item.disabled || undefined}
            aria-haspopup={sub ? "menu" : undefined}
            aria-expanded={sub ? expanded : undefined}
            data-menu-index={i}
            onclick={() => activate(item, depth, i, path)}
            onpointermove={(e) => hover(e, item, depth, i)}
          >
            {#if icons}
              <span class="icon">
                {#if item.icon}
                  <item.icon {...item.iconProps} />
                {:else if item.swatch}
                  <span class="dot" style:--c={item.swatch}></span>
                {:else}
                  {@render mark(item)}
                {/if}
              </span>
            {/if}
            <span class="text">
              <span class="label truncate">{armed === path ? item.confirm : item.label}</span>
              {#if item.note}<span class="note">{item.note}</span>{/if}
            </span>
            {#if (decorated || !icons) && item.checked}
              {@render mark(item)}
            {/if}
            {#if sub}
              <span class="caret" class:open={expanded && sheet}><CaretRightIcon /></span>
            {:else if item.hint}
              <Kbd hint={item.hint} />
            {/if}
          </button>
          {#if expanded && item.items}
            {#if sheet}
              <div class="inline-sub" role="menu" aria-label={item.label}>
                {@render level(item.items, depth + 1, `${path}.`)}
              </div>
            {:else}
              <div class="submenu surface" role="menu" aria-label={item.label} use:fit>
                {@render level(item.items, depth + 1, `${path}.`)}
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    {/each}
  </div>
{/snippet}

{#snippet body()}
  <div class="menu" style:--menu-min={minWidth} style:--menu-max={maxWidth}>
    {#if title}<div class="title truncate" role="presentation">{title}</div>{/if}
    {@render level(entries, 0, "")}
  </div>
{/snippet}

{#if sheet}
  <ActionSheet
    bind:this={actionSheet}
    bind:element={root}
    {onclose}
    label={title ?? label}
    {dismissLabel}
    onkeydown={onKeydown}
  >
    {@render body()}
  </ActionSheet>
{:else}
  <Popover
    {anchor}
    {placement}
    {onclose}
    label={title ?? label}
    role="menu"
    layer="menu"
    offset={2}
    padding="var(--sp-1)"
    autofocus
    volatile
    walk={false}
    onkeydown={onKeydown}
    bind:element={root}
  >
    {@render body()}
  </Popover>
{/if}

<style>
  .menu {
    display: flex;
    flex-direction: column;
    min-width: var(--menu-min);
    max-width: var(--menu-max);
    font-size: var(--fs-sm);
  }
  :global(body.mobile) .menu {
    min-width: 0;
    max-width: none;
    font-size: var(--fs-lg);
  }
  .title {
    padding: var(--gap-2) var(--gap-4) var(--sp-2);
    margin-bottom: var(--gap-1);
    border-bottom: 1px solid var(--border);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .heading {
    padding: var(--sp-2) var(--gap-4) var(--gap-1);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .sep {
    height: 1px;
    margin: var(--sp-1) var(--gap-3);
    background: var(--border);
  }
  .row {
    position: relative;
  }
  .item {
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    width: 100%;
    min-height: var(--row-h);
    padding: var(--gap-1) var(--gap-4);
    border-radius: var(--radius-sm);
    text-align: left;
    color: var(--color);
    outline: none;
  }
  :global(body.mobile) .item {
    padding: var(--sp-2) var(--sp-4);
  }
  .item:focus,
  .item[aria-expanded="true"] {
    background: var(--bg3);
    color: var(--color2);
  }
  .item[aria-disabled="true"] {
    opacity: 0.45;
    cursor: default;
  }
  .item.danger {
    color: var(--danger);
  }
  .item.danger:focus:not([aria-disabled="true"]),
  .item.armed {
    background: color-mix(in srgb, var(--danger) 14%, transparent);
    color: var(--danger);
  }
  .icon {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--icon-lg);
    font-size: var(--icon-md);
  }
  .mark {
    display: grid;
    place-items: center;
    flex: none;
    font-size: var(--icon-sm);
    color: var(--theme2);
  }
  .mark.mixed {
    color: var(--muted);
  }
  .icon {
    color: var(--muted);
  }
  .item:focus .icon,
  .item.danger .icon {
    color: inherit;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c);
  }
  .text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .note {
    font-size: var(--fs-xs);
    line-height: 1.35;
    color: var(--muted);
    white-space: normal;
  }
  .caret {
    display: grid;
    flex: none;
    font-size: var(--icon-sm);
    color: var(--muted);
    transition: transform var(--dur) var(--ease);
  }
  .caret.open {
    transform: rotate(90deg);
  }
  .submenu {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-menu);
    min-width: var(--menu-min);
    max-width: var(--menu-max);
    max-height: 60vh;
    overflow-y: auto;
    padding: var(--sp-1);
    box-shadow: var(--shadow-lg);
  }
  .inline-sub {
    padding-left: var(--sp-5);
  }
  .colors {
    display: grid;
    grid-template-columns: repeat(8, var(--swatch));
    justify-content: space-between;
    gap: var(--gap-3);
    padding: var(--gap-2) var(--gap-4) var(--sp-2);
  }
  .colors .swatch:focus-visible {
    outline: 2px solid var(--theme2);
    outline-offset: 2px;
  }
  .custom {
    position: relative;
    display: grid;
    place-items: center;
    background: transparent;
    box-shadow: inset 0 0 0 1px var(--border-strong);
    font-size: calc(var(--swatch) * 0.65);
    color: var(--muted);
    cursor: pointer;
  }
  .custom input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  .custom-entry {
    padding: var(--gap-1) var(--gap-2);
  }
</style>
