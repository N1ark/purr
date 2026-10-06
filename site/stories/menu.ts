import { Menu } from "purr";
import MenuPreview from "../previews/MenuPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Menu",
  group: "Overlays & menus",
  component: Menu,
  description:
    "The menu every menu renders from: icons, hints, checks, submenus, a colour grid and confirms, walked with the arrows. Apps usually open it through `menu` and a `ContextMenuHost`.",
  controls: {
    title: {
      type: "text",
      optional: true,
      value: "Design the schema",
      note: "A heading over the entries",
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
