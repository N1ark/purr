import { DatePicker } from "purr";
import DatePickerPreview from "../previews/DatePickerPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "DatePicker",
  group: "Forms",
  component: DatePicker,
  description:
    "A month to pick a day from, made for a `Popover`. Arrows walk the days, Page Up/Down the months; `value` and `onpick` are `dayKey`s.",
  controls: {},
  code: () => `<Popover {anchor} label="Due" onclose={close} autofocus>
  <DatePicker value={due} onpick={(day) => { due = day; close(); }} />
</Popover>`,
  preview: DatePickerPreview,
  keywords: ["date", "calendar", "day", "picker", "popover"],
});
