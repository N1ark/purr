import { MonthScroller } from "purr";
import MonthScrollerPreview from "../previews/MonthScrollerPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "MonthScroller",
  group: "Display",
  component: MonthScroller,
  description:
    "`MonthGrid`'s days as one continuous scroll of weeks, as in macOS Calendar: six weeks fill the view and a scroll stops at each month's first week. Bind `year` and `month` to follow the month in view (the days of the others fade), or set them to glide there. The `day` and `actions` snippets, `target` and `data-day` work as in `MonthGrid`; only the months around the one in view are rendered.",
  controls: {
    weekStart: {
      type: "select",
      pseudo: true,
      value: "locale",
      options: ["locale", "0", "1", "6"],
      note: "0 = Sunday",
    },
  },
  code: () => `<h3>{formatMonth(new Date(year, month, 1))}</h3>
<MonthScroller bind:year bind:month today={dayKey(Date.now())}>
  {#snippet day(d)}
    {#each byDay.get(d.key) ?? [] as event (event.id)}
      <button class="event" onclick={() => open(event)}>{event.title}</button>
    {/each}
  {/snippet}
</MonthScroller>`,
  width: "100%",
  preview: MonthScrollerPreview,
  keywords: ["calendar", "month", "scroll", "snap", "date", "schedule"],
});
