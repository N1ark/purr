import { ShortcutList } from "purr";
import { HELP } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ShortcutList",
  group: "Lists",
  component: ShortcutList,
  description:
    "Keyboard shortcuts by group, each row's keys as `Kbd`s. Feed it `keymap.help()` or `helpGroups(bindings)`, so the list is the bindings themselves.",
  controls: {
    or: { type: "text", default: "or", note: "Between two keys that do the same thing" },
    then: {
      type: "text",
      optional: true,
      value: "",
      note: "Between a chord's steps; the Kbd default otherwise",
    },
  },
  props: { groups: HELP },
  propsCode: { groups: "keymap.help()" },
  width: "420px",
});
