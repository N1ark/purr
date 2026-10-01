<script lang="ts">
  import { Field } from "purr";
  import type { PreviewProps } from "../lib/story";

  const { args, props }: PreviewProps = $props();
</script>

<div class="stage">
  <Field {...props}>
    {#if args.control === "input"}
      <input
        class="field-input"
        placeholder="Pick a name"
        aria-invalid={args.error ? true : undefined}
      />
    {:else if args.control === "checkbox"}
      <input type="checkbox" class="checkbox" />
    {:else}
      <select class="field-input">
        <option>Everyone</option>
        <option>Only me</option>
      </select>
    {/if}
  </Field>
</div>

<style>
  .stage {
    width: 300px;
    max-width: 100%;
  }
</style>
