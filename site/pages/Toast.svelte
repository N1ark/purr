<script lang="ts">
  import { Button, Segmented, toast, toasts } from "purr";
  import PageHeader from "../components/PageHeader.svelte";
  import Section from "../components/Section.svelte";
  import { hosts } from "../lib/site.svelte";

  let text = $state("Copied path");
  let kind = $state<"info" | "success" | "error">("info");
  let timeout = $state(3000);
  let withAction = $state(false);
  let lastId = $state<number | null>(null);

  function show() {
    const action = withAction ? { label: "Undo", run: () => toast("Undone") } : undefined;
    lastId = toast(text, { kind, timeout, action });
  }

  const code = $derived.by(() => {
    const opts: string[] = [];
    if (kind !== "info") opts.push(`kind: "${kind}"`);
    if (timeout !== (kind === "error" ? 8000 : 3000)) opts.push(`timeout: ${timeout}`);
    if (withAction) opts.push(`action: { label: "Undo", run: undo }`);
    return `toast(${JSON.stringify(text)}${opts.length ? `, { ${opts.join(", ")} }` : ""});`;
  });
</script>

<PageHeader
  title="toast"
  description="Brief notices for the app's one `ToastHost`. A repeat replaces itself; at most four show. `toast.error` takes whatever was thrown and stays longer."
  importLine={`import { toast, toasts, ToastHost } from "purr";`}
  source="src/lib/toast.svelte.ts"
/>

<Section
  title="Kinds"
  code={`toast("Copied path");
toast.success("Pushed to origin");
toast.error(new Error("Couldn't access the clipboard"));
toast("Undid: move", { action: { label: "Redo", run: redo } });`}
>
  <Button onclick={() => toast("Copied path")}>Info</Button>
  <Button onclick={() => toast.success("Pushed to origin")}>Success</Button>
  <Button onclick={() => toast.error(new Error("Couldn't access the clipboard"))}>Error</Button>
  <Button
    onclick={() => toast("Undid: move", { action: { label: "Redo", run: () => toast("Redid") } })}
  >
    With an action
  </Button>
</Section>

<Section
  title="Options"
  description="`timeout` in ms, 0 to keep it; `toast()` returns an id for `toasts.dismiss`."
  {code}
>
  <div class="s-stack">
    <div class="s-row">
      <input class="field-input short" aria-label="Text" bind:value={text} />
      <Segmented
        label="Kind"
        size="sm"
        options={[
          { id: "info", label: "info" },
          { id: "success", label: "success" },
          { id: "error", label: "error" },
        ]}
        bind:value={
          () => kind,
          (k: "info" | "success" | "error") => {
            kind = k;
            timeout = k === "error" ? 8000 : 3000;
          }
        }
      />
    </div>
    <div class="s-row">
      <label class="s-row field"
        >timeout <input
          class="field-input num"
          type="number"
          min="0"
          step="500"
          bind:value={timeout}
        /></label
      >
      <label class="s-row field"
        ><input type="checkbox" class="checkbox" bind:checked={withAction} /> action</label
      >
      <Button variant="primary" onclick={show}>Show</Button>
      <Button
        disabled={lastId === null || !toasts.list.some((t) => t.id === lastId)}
        onclick={() => lastId !== null && toasts.dismiss(lastId)}>Dismiss it</Button
      >
      <Button variant="ghost" onclick={() => toasts.clear()}>Clear all</Button>
    </div>
    <span class="s-out muted">toasts.list.length = {toasts.list.length}</span>
  </div>
</Section>

<Section
  title="ToastHost"
  description="Mount it once, near the root. `position` is bottom centre or the bottom corner."
  code={`<ToastHost position="${hosts.toast.position}" />`}
>
  <Segmented
    label="Position"
    size="sm"
    options={[
      { id: "bottom", label: "bottom" },
      { id: "bottom-end", label: "bottom-end" },
    ]}
    bind:value={hosts.toast.position}
  />
  <Button onclick={() => toast(`At the ${hosts.toast.position}`)}>Show one</Button>
</Section>

<style>
  .field {
    gap: var(--gap-3);
    font-size: var(--fs-sm);
  }
  .num {
    width: 90px;
  }
  .short {
    width: 220px;
    max-width: 100%;
  }
</style>
