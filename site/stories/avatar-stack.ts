import { AvatarStack } from "purr";
import { PEOPLE } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "AvatarStack",
  group: "Display",
  component: AvatarStack,
  description: 'A few overlapping avatars and a "+N" for the rest.',
  controls: {
    people: {
      type: "number",
      pseudo: true,
      value: 5,
      min: 0,
      max: PEOPLE.length,
      note: "How many people",
    },
    max: { type: "number", default: 3, min: 1, max: 7 },
    size: { type: "number", optional: true, value: 28, min: 12, max: 64 },
    round: { type: "boolean", default: false, value: true },
    title: { type: "text", optional: true, value: "" },
  },
  props: (args) => ({ people: PEOPLE.slice(0, Number(args.people ?? 0)) }),
  propsCode: { people: "people" },
  examples: [
    { title: "Two, square", args: { people: 2, round: false, size: 22 } },
    { title: "Seven, max 5", args: { people: 7, max: 5 } },
  ],
});
