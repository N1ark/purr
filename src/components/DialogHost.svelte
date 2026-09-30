<script lang="ts">
  // Mount once: renders what `dialog.ask(...)`, `confirmAction` and `promptText` ask. Enter
  // confirms from anywhere but a textarea; Escape is the overlay stack's.
  import { dialog } from "../lib/dialog.svelte";
  import Modal from "./Modal.svelte";

  const uid = $props.id();

  function onKeydown(e: KeyboardEvent) {
    if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
    if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement) return;
    e.preventDefault();
    dialog.confirm();
  }
</script>

{#if dialog.open}
  <Modal
    label={dialog.title}
    onclose={() => dialog.cancel()}
    layer="dialog"
    width="min(360px, calc(100vw - 32px))"
    mobile="keep"
    padded
    onkeydown={onKeydown}
  >
    <h2>{dialog.title}</h2>
    {#if dialog.description}
      <p class="description">{dialog.description}</p>
    {/if}

    {#each dialog.fields as field, i (field.name)}
      {@const id = `${uid}-${i}`}
      {#if field.type === "checkbox"}
        <label class="check">
          <input
            type="checkbox"
            checked={dialog.values[field.name] === true}
            onchange={(e) => (dialog.values[field.name] = e.currentTarget.checked)}
          />
          <span>{field.label}</span>
        </label>
      {:else}
        <label class="label" for={id}>{field.label}</label>
        {#if field.type === "textarea"}
          <textarea
            {id}
            class="field-input"
            rows="3"
            placeholder={field.placeholder}
            value={String(dialog.values[field.name] ?? "")}
            oninput={(e) => (dialog.values[field.name] = e.currentTarget.value)}
            data-autofocus={i === 0 ? "select" : undefined}></textarea>
        {:else if field.type === "select"}
          <select
            {id}
            class="field-input"
            value={String(dialog.values[field.name] ?? "")}
            onchange={(e) => (dialog.values[field.name] = e.currentTarget.value)}
          >
            {#each field.options ?? [] as option (option.value)}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        {:else}
          <input
            {id}
            class="field-input"
            type={field.type === "password" ? "password" : "text"}
            placeholder={field.placeholder}
            value={String(dialog.values[field.name] ?? "")}
            oninput={(e) => (dialog.values[field.name] = e.currentTarget.value)}
            data-autofocus={i === 0 ? "select" : undefined}
          />
        {/if}
      {/if}
      {#if field.hint}<span class="hint">{field.hint}</span>{/if}
    {/each}

    <div class="actions">
      <button type="button" class="btn" onclick={() => dialog.cancel()}>{dialog.cancelLabel}</button
      >
      <button
        type="button"
        class={["btn", dialog.danger ? "btn--danger" : "btn--primary"]}
        disabled={!dialog.ready}
        data-autofocus={dialog.fields.length === 0 ? "" : undefined}
        onclick={() => dialog.confirm()}
      >
        {dialog.confirmLabel}
      </button>
    </div>
  </Modal>
{/if}

<style>
  h2 {
    margin: 0 0 var(--sp-1);
    font-size: var(--fs-base);
    font-weight: 600;
    color: var(--color2);
  }
  .description {
    margin: 0 0 var(--sp-2);
    font-size: var(--fs-sm);
    color: var(--muted);
  }
  .label {
    display: block;
    margin: var(--sp-4) 0 var(--sp-1);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .field-input {
    width: 100%;
  }
  textarea.field-input {
    resize: vertical;
  }
  .check {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    margin-top: var(--sp-4);
    font-size: var(--fs-sm);
  }
  .check input {
    margin: 0;
    accent-color: var(--theme);
  }
  .hint {
    display: block;
    margin-top: var(--sp-1);
    font-size: var(--fs-xs);
    color: var(--muted);
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--gap-3);
    margin-top: var(--sp-5);
  }
</style>
