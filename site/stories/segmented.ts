import { Segmented } from "purr";
import { Hash, Rows, SquaresFour } from "purr/icons";
import { defineStory } from "../lib/story";

const OPTIONS = [
  { id: "list", label: "List", icon: Rows },
  { id: "grid", label: "Grid", icon: SquaresFour },
  { id: "board", label: "Board", icon: Hash },
];

export default defineStory({
  title: "Segmented",
  group: "Controls",
  component: Segmented,
  description:
    "Mutually exclusive options sharing one border, each with an optional icon and its own `disabled`. Each option states whether it is on with `aria-pressed`.",
  controls: {
    value: { type: "select", options: ["list", "grid", "board"], value: "list" },
    label: { type: "text", value: "View" },
    size: { type: "select", options: ["sm", "md"], default: "md" },
    icons: { type: "boolean", pseudo: true, value: false, note: "Give the options icons" },
    boardDisabled: {
      type: "boolean",
      pseudo: true,
      value: false,
      note: "Disable the third option",
    },
  },
  props: (args) => ({
    options: OPTIONS.map((o) => ({
      id: o.id,
      label: o.label,
      icon: args.icons ? o.icon : undefined,
      disabled: o.id === "board" && args.boardDisabled ? true : undefined,
    })),
  }),
  propsCode: { options: "options" },
  events: { onchange: { sync: (_, value: string) => ({ value }), bind: "value" } },
  examples: [
    { title: "Small, with icons", args: { size: "sm", icons: true } },
    { title: "One disabled", args: { boardDisabled: true, value: "grid" } },
  ],
});
