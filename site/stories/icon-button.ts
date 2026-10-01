import { IconButton } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "IconButton",
  group: "Controls",
  component: IconButton,
  description:
    "A square button holding one icon. The label is its accessible name and its tooltip; `shortcut` adds a key hint to that tooltip. `ghost` until hovered, or a bordered `default`.",
  controls: {
    icon: { type: "icon", value: "Gear", note: "The child icon" },
    label: { type: "text", value: "Settings" },
    size: {
      type: "select",
      options: ["sm", "md", "lg"],
      default: "md",
      note: "sm inline in a row, md panel chrome, lg toolbars (44px on touch)",
    },
    variant: { type: "select", options: ["ghost", "default"], default: "ghost" },
    danger: { type: "boolean", default: false, note: "Hover turns it red" },
    pressed: {
      type: "select",
      options: [
        { label: "unset", value: undefined },
        { label: "false", value: false, code: "false" },
        { label: "true", value: true, code: "true" },
      ],
      default: "unset",
      note: "A toggle's state, as aria-pressed",
    },
    shortcut: { type: "text", optional: true, value: "Mod+,", note: "Shown in the tooltip" },
    disabled: { type: "boolean", default: false },
  },
  children: { icon: "icon" },
  events: { onclick: "openSettings" },
  examples: [
    { title: "Small, inline", args: { size: "sm", icon: "X", label: "Remove", shortcut: "" } },
    {
      title: "Toolbar",
      args: { size: "lg", icon: "ArrowsClockwise", label: "Refresh", shortcut: "Mod+R" },
    },
    { title: "Danger", args: { danger: true, icon: "Trash", label: "Delete", shortcut: "" } },
    {
      title: "Bordered",
      args: { variant: "default", icon: "PencilSimple", label: "Edit", shortcut: "" },
    },
    { title: "Pressed", args: { pressed: "true", icon: "PushPin", label: "Pinned", shortcut: "" } },
    { title: "Disabled", args: { disabled: true, icon: "Star", label: "Star", shortcut: "" } },
  ],
});
