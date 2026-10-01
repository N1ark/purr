<script lang="ts">
  import { Button, Switch, confirmAction, dialog, promptText, toast } from "purr";
  import { describe } from "../lib/format";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";

  let log = $state<{ id: number; call: string; result: string }[]>([]);
  let seq = 0;
  function record(call: string, result: unknown) {
    log = [{ id: ++seq, call, result: describe(result) }, ...log].slice(0, 6);
    toast(`${call} → ${describe(result)}`);
  }

  let danger = $state(true);

  async function ask() {
    const ok = await confirmAction("Discard this draft?", {
      description: "It has not been sent, and it cannot be brought back.",
      confirmLabel: "Discard",
      danger,
    });
    record("confirmAction", ok);
  }

  async function rename() {
    const name = await promptText("Rename topic", { label: "New name", value: "Menus" });
    record("promptText", name);
  }

  async function form() {
    const values = await dialog.ask({
      title: "New repository",
      description: "Everything but the name can change later.",
      confirmLabel: "Create",
      fields: [
        { name: "name", label: "Name", required: true, placeholder: "purr" },
        { name: "about", label: "Description", type: "textarea", hint: "Shown on the front page." },
        {
          name: "visibility",
          label: "Visibility",
          type: "select",
          value: "private",
          options: [
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
          ],
        },
        { name: "token", label: "Token", type: "password" },
        { name: "readme", label: "Add a README", type: "checkbox", value: true },
      ],
    });
    record("dialog.ask", values);
  }
</script>

<PageHeader
  title="confirmAction & promptText"
  description="A promise, not a callback tree: `await` a yes/no question, a line of text or a small form. One `DialogHost` renders them; Enter confirms from anywhere but a textarea, Escape cancels. For anything richer than a few fields, write a `Modal`."
  importLine={`import { confirmAction, promptText, dialog, DialogHost } from "purr";`}
  source="src/lib/dialog.svelte.ts"
/>

<Section
  title="confirmAction"
  description="Resolves true or false. `danger` paints the confirm button red."
  code={`const ok = await confirmAction("Discard this draft?", {
  description: "It has not been sent, and it cannot be brought back.",
  confirmLabel: "Discard",${danger ? "\n  danger: true," : ""}
});`}
>
  <Button variant={danger ? "danger" : "default"} onclick={ask}>Discard…</Button>
  <Switch label="danger" bind:checked={danger} />
  <span class="muted">danger</span>
</Section>

<Section
  title="promptText"
  description="One required line of text: the trimmed value, or null when cancelled or left empty."
  code={`const name = await promptText("Rename topic", { label: "New name", value: "Menus" });`}
>
  <Button onclick={rename}>Rename…</Button>
</Section>

<Section
  title="dialog.ask"
  description="A few fields of any kind: text, textarea, select, checkbox, password. `required` blocks confirming while empty. Resolves the values by name, or null."
  code={`const values = await dialog.ask({
  title: "New repository",
  confirmLabel: "Create",
  fields: [
    { name: "name", label: "Name", required: true },
    { name: "about", label: "Description", type: "textarea" },
    { name: "visibility", label: "Visibility", type: "select", options: [...] },
    { name: "token", label: "Token", type: "password" },
    { name: "readme", label: "Add a README", type: "checkbox", value: true },
  ],
});`}
>
  <Button onclick={form}>New repository…</Button>
</Section>

<section class="results">
  <h2>Answers</h2>
  <div class="s-box s-stack">
    {#each log as entry (entry.id)}
      <span class="s-out"><span class="muted">{entry.call} →</span> {entry.result}</span>
    {:else}
      <span class="muted">Open a dialog above; what it resolves to shows here.</span>
    {/each}
  </div>
</section>

<style>
  .results h2 {
    margin: 0 0 var(--sp-3);
    font-size: var(--fs-lg);
    font-weight: 600;
    color: var(--color2);
  }
  .results .s-stack {
    gap: var(--gap-2);
  }
</style>
