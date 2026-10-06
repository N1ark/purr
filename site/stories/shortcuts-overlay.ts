import { ShortcutsOverlay } from "purr";
import { HELP } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ShortcutsOverlay",
  group: "Overlays & menus",
  component: ShortcutsOverlay,
  description: "The `?` overlay: a `ShortcutList` in a modal. Press ? to see this site's.",
  controls: {
    title: { type: "text", default: "Keyboard shortcuts" },
    or: { type: "text", optional: true, value: "" },
    then: { type: "text", optional: true, value: "" },
    closeLabel: { type: "text", optional: true, value: "" },
  },
  props: { groups: HELP },
  propsCode: { groups: "keymap.help()" },
  overlay: { close: "onclose", open: "Show the shortcuts" },
  events: { onclose: true },
});
