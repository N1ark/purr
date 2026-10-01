import { Switch } from "purr";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "Switch",
  group: "Controls",
  component: Switch,
  description:
    "An on/off toggle that applies at once, for settings. The label is its accessible name; put a visible one beside it (a `SettingRow`).",
  controls: {
    checked: { type: "boolean", value: true },
    label: { type: "text", value: "Notifications" },
    disabled: { type: "boolean", default: false },
  },
  events: {
    onchange: { sync: (_, checked: boolean) => ({ checked }), bind: "checked" },
  },
  examples: [
    { title: "Off", args: { checked: false } },
    { title: "Disabled", args: { checked: true, disabled: true } },
  ],
});
