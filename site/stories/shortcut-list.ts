import { ShortcutList } from "purr";
import { HELP } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ShortcutList",
  group: "Lists",
  component: ShortcutList,
  description: "Keyboard shortcuts by group, fed by `keymap.help()` or `helpGroups(bindings)`.",
  controls: {
    or: { type: "text", default: "or", note: "Between alternative keys" },
    then: {
      type: "text",
      optional: true,
      value: "",
      note: "Between a chord's steps",
    },
  },
  props: { groups: HELP },
  propsCode: { groups: "keymap.help()" },
  width: "420px",
});
