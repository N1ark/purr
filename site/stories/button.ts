import { Button } from "purr";
import ButtonDemo from "../demos/ButtonDemo.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Button",
  group: "Controls",
  component: Button,
  description:
    "A `.btn` as a component, with a loading state that blocks clicks and a pressed state for toggles.",
  controls: {
    children: { type: "text", value: "Save" },
    icon: { type: "icon", optional: true },
    variant: {
      type: "select",
      options: ["default", "primary", "ghost", "danger", "link"],
      default: "default",
      value: "primary",
    },
    size: { type: "select", options: ["sm", "md", "lg"], default: "md" },
    disabled: { type: "boolean", default: false },
    loading: { type: "boolean", default: false },
    loadingLabel: { type: "text", default: "Loading", note: "Announced while loading" },
    pressed: {
      type: "select",
      options: [
        { label: "unset", value: undefined },
        { label: "false", value: false, code: "false" },
        { label: "true", value: true, code: "true" },
      ],
      default: "unset",
      note: "A toggle's state",
    },
  },
  children: { text: "children", icon: "icon" },
  events: { onclick: "save" },
  examples: [
    { title: "Ghost with an icon", args: { variant: "ghost", icon: "Plus", children: "Add" } },
    { title: "Danger", args: { variant: "danger", icon: "Trash", children: "Delete" } },
    { title: "Loading", args: { loading: true, children: "Saving…" } },
    {
      title: "Pressed toggle",
      args: { variant: "default", pressed: "true", icon: "PushPin", children: "Pinned" },
    },
    { title: "Link", args: { variant: "link", children: "Show more" } },
    { title: "Large primary", args: { size: "lg", children: "Continue" } },
  ],
  demo: ButtonDemo,
});
