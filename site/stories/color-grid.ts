import { ColorGrid } from "purr";
import { CHANNELS, TAGS } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ColorGrid",
  group: "Controls",
  component: ColorGrid,
  description:
    'A grid of swatches to pick from, walked with the arrows, optionally with "automatic" (`null`) and any colour through the native picker.',
  controls: {
    value: { type: "color", optional: true, value: "#61afef", note: "null is automatic" },
    palette: {
      type: "select",
      pseudo: true,
      options: [
        { label: "tags", value: TAGS },
        { label: "channels", value: CHANNELS },
      ],
      value: "tags",
    },
    label: { type: "text", default: "Colour", value: "Tag colour" },
    columns: { type: "number", default: 8, min: 1, max: 12, value: 4 },
    shape: { type: "select", options: ["square", "round"], default: "square", value: "round" },
    auto: { type: "boolean", default: false, value: true, note: "Offer automatic (null)" },
    autoLabel: { type: "text", default: "Automatic" },
    custom: { type: "boolean", default: false, value: true, note: "Offer the native picker" },
  },
  props: (args) => ({
    colors: args.palette === "channels" ? CHANNELS : TAGS,
    value: args.value || null,
  }),
  propsCode: { colors: "colors" },
  events: {
    onpick: { sync: (_, value: string | null) => ({ value }), handler: "pick" },
    oncustominput: { sync: (_, value: string) => ({ value }) },
  },
  examples: [
    {
      title: "Channel colours, square",
      args: {
        palette: "channels",
        shape: "square",
        columns: 7,
        auto: false,
        custom: false,
        value: CHANNELS[2],
      },
    },
  ],
});
