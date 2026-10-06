import { TimePicker } from "purr";
import TimePickerPreview from "../previews/TimePickerPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "TimePicker",
  group: "Forms",
  component: TimePicker,
  description:
    "A time of day for a `Popover`: a field for an exact time over a list every `step` minutes. `noneLabel` adds an entry for no time (`null`).",
  controls: {
    step: { type: "select", value: "30", options: ["15", "30", "60"] },
  },
  code: (a) =>
    `<TimePicker value={time} step={${a.step}} noneLabel="No time" onpick={(t) => (time = t)} />`,
  preview: TimePickerPreview,
  keywords: ["time", "clock", "hour", "picker", "popover"],
});
