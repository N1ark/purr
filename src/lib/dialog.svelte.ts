/**
 * A promise, not a callback tree: `await dialog.ask(...)`, where null means cancelled. One
 * `DialogHost` renders it. For anything richer than a few fields, write a `Modal`.
 */

export interface DialogField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "checkbox" | "password";
  value?: string | boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Blocks confirming while empty. */
  required?: boolean;
}

export interface DialogSpec {
  title: string;
  description?: string;
  fields?: DialogField[];
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export type DialogValues = Record<string, string | boolean>;

class DialogState {
  open = $state(false);
  title = $state("");
  description = $state<string | null>(null);
  fields = $state<DialogField[]>([]);
  confirmLabel = $state("OK");
  cancelLabel = $state("Cancel");
  danger = $state(false);
  values = $state<DialogValues>({});

  #resolve: ((value: DialogValues | null) => void) | null = null;

  ask(spec: DialogSpec): Promise<DialogValues | null> {
    // A second dialog would strand the first one's promise.
    this.#resolve?.(null);

    this.title = spec.title;
    this.description = spec.description ?? null;
    this.fields = spec.fields ?? [];
    this.confirmLabel = spec.confirmLabel ?? "OK";
    this.cancelLabel = spec.cancelLabel ?? "Cancel";
    this.danger = spec.danger === true;
    this.values = Object.fromEntries(
      this.fields.map((f) => [f.name, f.value ?? (f.type === "checkbox" ? false : "")]),
    );
    this.open = true;

    return new Promise((resolve) => {
      this.#resolve = resolve;
    });
  }

  /** True when every required field has something in it. */
  get ready(): boolean {
    return this.fields.every(
      (f) => !f.required || String(this.values[f.name] ?? "").trim().length > 0,
    );
  }

  confirm() {
    if (!this.open || !this.ready) return;
    const values = $state.snapshot(this.values) as DialogValues;
    this.#finish(values);
  }

  cancel() {
    if (this.open) this.#finish(null);
  }

  #finish(values: DialogValues | null) {
    this.open = false;
    this.fields = [];
    const resolve = this.#resolve;
    this.#resolve = null;
    resolve?.(values);
  }
}

export const dialog = new DialogState();

/** Ask for one line of text: the trimmed value, or null. */
export async function promptText(
  title: string,
  field: Omit<DialogField, "name"> = { label: "" },
  labels: { confirm?: string; cancel?: string } = {},
): Promise<string | null> {
  const answer = await dialog.ask({
    title,
    confirmLabel: labels.confirm ?? "Save",
    cancelLabel: labels.cancel,
    fields: [{ name: "value", required: true, ...field }],
  });
  const value = String(answer?.value ?? "").trim();
  return answer && value ? value : null;
}

/** Ask a yes/no question. */
export async function confirmAction(
  title: string,
  options: {
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  } = {},
): Promise<boolean> {
  return (
    (await dialog.ask({
      title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? "Confirm",
      cancelLabel: options.cancelLabel,
      danger: options.danger,
    })) !== null
  );
}
