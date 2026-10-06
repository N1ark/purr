import { DatePicker } from "purr";
import DatePickerPreview from "../previews/DatePickerPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "DatePicker",
  group: "Forms",
  component: DatePicker,
  description:
    "A small month to pick a day from, made to sit in a `Popover`: the arrows walk the days and Page Up/Down the months, Enter or a click picks one. `value` and `onpick` are `dayKey`s; today is marked, the picked day filled.",
  controls: {},
  code: () => `<Popover {anchor} label="Due" onclose={close} autofocus>
  <DatePicker value={due} onpick={(day) => { due = day; close(); }} />
</Popover>`,
  preview: DatePickerPreview,
  keywords: ["date", "calendar", "day", "picker", "popover"],
});
