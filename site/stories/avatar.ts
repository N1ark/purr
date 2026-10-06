import { Avatar } from "purr";
import { PICTURE } from "../lib/samples";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Avatar",
  group: "Display",
  component: Avatar,
  description:
    "A picture, or initials on a colour derived from `seed`; a picture that fails to load falls back to the initials.",
  controls: {
    name: { type: "text", value: "Ada Lovelace" },
    src: {
      type: "select",
      options: [
        { label: "none", value: undefined },
        { label: "picture", value: PICTURE, code: "picture" },
        { label: "broken", value: "/does-not-exist.png", code: '"/does-not-exist.png"' },
      ],
      default: "none",
    },
    seed: {
      type: "text",
      optional: true,
      value: "",
      note: "Colour source; name by default",
    },
    size: {
      type: "number",
      optional: true,
      value: 40,
      min: 12,
      max: 96,
      note: "px; unset follows --avatar",
    },
    round: { type: "boolean", default: false },
    presence: {
      type: "select",
      options: [{ label: "none", value: undefined }, "active", "idle", "offline"],
      default: "none",
    },
    presenceLabel: { type: "text", optional: true, value: "" },
    title: { type: "text", optional: true, value: "", note: "Hover text; name by default" },
  },
  examples: [
    {
      title: "Picture, round, active",
      args: { src: "picture", round: true, presence: "active", name: "Grace Hopper" },
    },
    { title: "Broken picture", args: { src: "broken", name: "Broken Picture" } },
    { title: "Follows --avatar", args: { size: undefined, name: "Linus" } },
    {
      title: "Email seed",
      args: { name: "someone@example.com", seed: "someone@example.com", round: true },
    },
  ],
});
