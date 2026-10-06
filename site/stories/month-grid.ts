import { MonthGrid } from "purr";
import MonthGridPreview from "../previews/MonthGridPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "MonthGrid",
  group: "Display",
  component: MonthGrid,
  description:
    "A month as six weeks from `firstWeekday`, today marked. Each day carries `data-day` (its `dayKey`) for drag and drop; it fills its container's height.",
  controls: {
    weekStart: {
      type: "select",
      pseudo: true,
      value: "locale",
      options: ["locale", "0", "1", "6"],
      note: "0 = Sunday",
    },
    target: { type: "boolean", pseudo: true, value: false, note: "A day under a drag" },
  },
  code: () => `<MonthGrid year={2026} month={9} today={dayKey(Date.now())} target={over}>
  {#snippet day(d)}
    {#each byDay.get(d.key) ?? [] as event (event.id)}
      <button class="event" onclick={() => open(event)}>{event.title}</button>
    {/each}
  {/snippet}
  {#snippet actions(d)}
    <IconButton label="New event" size="sm" onclick={() => create(d.key)}><Plus /></IconButton>
  {/snippet}
</MonthGrid>`,
  width: "100%",
  preview: MonthGridPreview,
  keywords: ["calendar", "month", "date", "schedule", "monthGrid", "firstWeekday"],
});
