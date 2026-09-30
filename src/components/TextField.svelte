<script lang="ts">
  // A `.field-input` inside a `Field`: label, input, hint or error, wired for readers.
  import type { HTMLInputAttributes } from "svelte/elements";
  import Field from "./Field.svelte";

  interface Props extends Omit<HTMLInputAttributes, "value" | "children"> {
    value: string | number | null | undefined;
    label?: string;
    hint?: string;
    error?: string;
    /** The `<input>`, for callers that focus or select it. */
    input?: HTMLInputElement | null;
  }

  const uid = $props.id();
  let {
    value = $bindable(),
    label,
    hint,
    error,
    input = $bindable(null),
    class: extra,
    ...rest
  }: Props = $props();
</script>

<Field {label} {hint} {error} id={uid}>
  <input
    bind:this={input}
    bind:value
    class={["field-input", extra]}
    aria-invalid={error ? true : undefined}
    aria-describedby={error || hint ? `${uid}-note` : undefined}
    {...rest}
  />
</Field>
