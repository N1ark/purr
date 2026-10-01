import { Menu } from "purr";
import MenuPreview from "../previews/MenuPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Menu",
  group: "Overlays & menus",
  component: Menu,
  description:
    "The menu every menu renders from: items with icons, hints, checks and notes, headings, separators, submenus, a colour grid, custom rows, and two-press confirms. Arrows walk it, → opens a submenu, letters jump. As an action sheet on a phone. Most apps open it through `menu` and a `ContextMenuHost` instead.",
  controls: {
    title: {
      type: "text",
      optional: true,
      value: "Design the schema",
      note: "A small heading over the entries",
    },
    label: { type: "text", default: "Menu", note: "Announced when there is no title" },
    placement: {
      type: "select",
      options: ["bottom-start", "bottom-end", "top-start", "right-start", "left-start"],
      default: "bottom-start",
    },
    sheet: {
      type: "select",
      options: [
        { label: "auto", value: undefined },
        { label: "true", value: true, code: "true" },
        { label: "false", value: false, code: "false" },
      ],
      default: "auto",
      note: "An action sheet; on body.mobile by default",
    },
    minWidth: { type: "text", default: "180px" },
    maxWidth: { type: "text", default: "300px" },
    dismissLabel: { type: "text", default: "Dismiss" },
  },
  overlay: { close: "onclose", open: "Open the menu" },
  events: { onclose: true, "entry.run": true },
  propsCode: { entries: "entries(...noteMenu())", anchor: "button" },
  uses: ["entries"],
  preview: MenuPreview,
});
