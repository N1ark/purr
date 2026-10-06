import { ThemeScript } from "purr";
import ThemeScriptPreview from "../previews/ThemeScriptPreview.svelte";
import { defineStory } from "../lib/story";

export default defineStory({
  title: "ThemeScript",
  group: "Layout",
  component: ThemeScript,
  description:
    "For a server-rendered page: `bootTheme` inlined in the `<head>`, so the first paint is already in the stored theme. On mount, call `applyTheme({ mode: storedThemeMode(key), storageKey: key })`.",
  controls: {
    storageKey: { type: "text", value: "theme", required: true },
    nonce: { type: "text", optional: true, value: "" },
  },
  code: (args) => `<!-- +layout.svelte -->
<script lang="ts">
  import { ThemeScript, applyTheme, liveTheme, storedThemeMode } from "purr";
  import { onMount } from "svelte";

  const key = ${JSON.stringify(args.storageKey)};
  onMount(() => applyTheme({ mode: storedThemeMode(key), storageKey: key }));
  const toggle = () => applyTheme({ mode: liveTheme.dark ? "light" : "dark", storageKey: key });
</script>

<ThemeScript storageKey={key} />`,
  preview: ThemeScriptPreview,
  width: "100%",
  keywords: ["ssr", "sveltekit", "dark mode", "flash", "fouc", "bootTheme", "liveTheme"],
});
