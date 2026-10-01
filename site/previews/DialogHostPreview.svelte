<script lang="ts">
  import { Button, confirmAction, dialog, promptText, type DialogField } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, on }: PreviewProps = $props();

  function fields(): DialogField[] {
    if (args.fields === "one line")
      return [{ name: "name", label: "New name", value: "Menus", required: true }];
    if (args.fields === "a form")
      return [
        { name: "name", label: "Name", placeholder: "Release notes", required: true },
        {
          name: "kind",
          label: "Kind",
          type: "select",
          value: "note",
          options: [
            { value: "note", label: "Note" },
            { value: "task", label: "Task" },
          ],
        },
        { name: "notes", label: "Notes", type: "textarea", hint: "Markdown is fine." },
        { name: "token", label: "Token", type: "password" },
        { name: "private", label: "Private", type: "checkbox" },
      ];
    return [];
  }

  async function ask() {
    const answer = await dialog.ask({
      title: String(args.title),
      description: args.description ? String(args.description) : undefined,
      fields: fields(),
      confirmLabel: args.confirmLabel ? String(args.confirmLabel) : undefined,
      cancelLabel: args.cancelLabel ? String(args.cancelLabel) : undefined,
      danger: Boolean(args.danger),
    });
    on.resolved(answer);
  }
</script>

<Button variant={args.danger ? "danger" : "primary"} onclick={ask}>dialog.ask(…)</Button>
<Button
  onclick={async () =>
    on.resolved(
      await confirmAction("Discard this draft?", {
        description: "It has not been sent, and it cannot be brought back.",
        confirmLabel: "Discard",
        danger: true,
      }),
    )}>confirmAction(…)</Button
>
<Button
  onclick={async () =>
    on.resolved(await promptText("Rename topic", { label: "New name", value: "Menus" }))}
  >promptText(…)</Button
>
