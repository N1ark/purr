import { SearchInput } from "purr";
import SearchInputDemo from "../demos/SearchInputDemo.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "SearchInput",
  group: "Forms",
  component: SearchInput,
  description:
    "The filter at the top of a list: `bar` is a full-width row with a rule under it (a panel's first line), `field` a rounded box among other controls. `trailing` holds a filter toggle or a count.",
  width: "360px",
  controls: {
    value: { type: "text", value: "" },
    label: { type: "text", value: "Filter channels", note: "The accessible name" },
    placeholder: { type: "text", optional: true, value: "Filter channels" },
    variant: { type: "select", options: ["bar", "field"], default: "bar" },
    clearable: {
      type: "boolean",
      default: false,
      value: true,
      note: "A clear button while there is text",
    },
    clearLabel: { type: "text", default: "Clear" },
  },
  events: {
    oninput: {
      sync: (_, e: Event & { currentTarget: HTMLInputElement }) => ({
        value: e.currentTarget.value,
      }),
      bind: "value",
    },
    onkeydown: true,
  },
  examples: [
    { title: "Field", args: { variant: "field", value: "wiki", placeholder: "Search notes…" } },
  ],
  demo: SearchInputDemo,
});
