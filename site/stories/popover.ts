import { Popover } from "purr";
import PopoverPreview from "../previews/PopoverPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Popover",
  group: "Overlays & menus",
  component: Popover,
  description:
    'A card hung off an element, a rect or a point, flipped when there is no room and closed by Escape or a click outside. `role="menu"` walks its entries with the arrows.',
  controls: {
    label: { type: "text", value: "Switch branch" },
    placement: {
      type: "select",
      options: [
        "bottom-start",
        "bottom",
        "bottom-end",
        "top-start",
        "top",
        "top-end",
        "left",
        "left-start",
        "right",
        "right-start",
      ],
      default: "bottom-start",
    },
    role: {
      type: "select",
      options: ["dialog", "menu", "listbox"],
      default: "dialog",
      value: "menu",
    },
    layer: { type: "select", options: ["popover", "card", "menu"], default: "popover" },
    offset: { type: "number", default: 4, min: 0 },
    margin: { type: "number", default: 8, min: 0 },
    width: { type: "text", optional: true, value: "260px" },
    padding: { type: "text", optional: true, value: "var(--sp-2)" },
    maxHeight: { type: "text", optional: true, value: "" },
    autofocus: { type: "boolean", default: false, value: true },
    volatile: { type: "boolean", default: false, note: "Close on scroll, resize or blur" },
    walk: {
      type: "select",
      options: [
        { label: "unset", value: undefined },
        { label: "true", value: true, code: "true" },
        { label: "false", value: false, code: "false" },
      ],
      default: "unset",
      note: "Arrows walk the entries; on unless role is dialog",
    },
  },
  overlay: { close: "onclose" },
  events: { onclose: true, onkeydown: true },
  propsCode: { anchor: "button" },
  inner: () =>
    `<input class="field-input" placeholder="Switch to branch…" bind:value={filter} />\n{#each hits as branch}\n  <button class="row-item" role="menuitem" onclick={() => checkout(branch)}>{branch}</button>\n{/each}`,
  preview: PopoverPreview,
});
