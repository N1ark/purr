<script lang="ts">
  // A `.field-input` textarea inside a `Field`.
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import Field from "./Field.svelte";

  interface Props extends Omit<HTMLTextareaAttributes, "value" | "children"> {
    value: string | null | undefined;
    label?: string;
    hint?: string;
    error?: string;
    /** Monospace, for code, templates and commit messages. */
    mono?: boolean;
    textarea?: HTMLTextAreaElement | null;
  }

  const uid = $props.id();
  let {
    value = $bindable(),
    label,
    hint,
    error,
    mono = false,
    textarea = $bindable(null),
    rows = 4,
    class: extra,
    ...rest
  }: Props = $props();
</script>

<Field {label} {hint} {error} id={uid}>
  <textarea
    bind:this={textarea}
    bind:value
    {rows}
    class={["field-input", mono && "mono", extra]}
    aria-invalid={error ? true : undefined}
    aria-describedby={error || hint ? `${uid}-note` : undefined}
    {...rest}></textarea>
</Field>
