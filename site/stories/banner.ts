import { Banner } from "purr";
import BannerPreview from "../previews/BannerPreview.svelte";
import { defineStory } from "../lib/story";

const linesOf = (text: unknown) =>
  String(text ?? "")
    .split("\n")
    .filter(Boolean);

export default defineStory({
  title: "Banner",
  group: "Display",
  component: Banner,
  description:
    "A notice that stays until acted on: an update ready to install, a lost connection. Floats in the bottom corner, or sits `inline` in the page; `actions` holds its buttons.",
  controls: {
    title: { type: "text", value: "Purr 0.2.0 is ready — restart to apply" },
    lines: {
      type: "text",
      pseudo: true,
      multiline: true,
      value: "Menus walk with the arrows\nTooltips no longer flicker",
      note: "One per line",
    },
    icon: { type: "icon", optional: true, value: "ArrowsClockwise" },
    tone: { type: "select", options: ["info", "warn", "danger", "success"], default: "info" },
    placement: {
      type: "select",
      options: ["corner", "inline"],
      default: "corner",
      value: "inline",
    },
    actions: { type: "boolean", pseudo: true, value: true, note: "A Restart button" },
    dismissLabel: { type: "text", default: "Dismiss", value: "Not now" },
  },
  props: (args) => ({ lines: linesOf(args.lines) }),
  propsCode: (args): Record<string, string> => {
    const lines = linesOf(args.lines);
    return lines.length ? { lines: JSON.stringify(lines) } : {};
  },
  events: { ondismiss: { handler: "dismiss", optional: true, on: true } },
  inner: (args) =>
    args.actions
      ? `{#snippet actions()}\n  <Button variant="primary" size="sm" onclick={restart}>Restart</Button>\n{/snippet}`
      : "",
  uses: ["Button"],
  preview: BannerPreview,
});
