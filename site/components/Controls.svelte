<script lang="ts">
  // The controls panel: one row per control a story declares, plus a checkbox per optional
  // callback. Edits `args` in place.
  import { Checkbox, Segmented, Switch, tooltip } from "purr";
  import { ICONS, ICON_NAMES } from "../lib/icons";
  import { eventSpecs, optionOf, type Args, type Control, type Story } from "../lib/story";

  interface Props {
    story: Story;
    args: Args;
  }

  let { story, args = $bindable() }: Props = $props();

  const controls = $derived(Object.entries(story.controls ?? {}));
  const optionalEvents = $derived(eventSpecs(story).filter(([, spec]) => spec.optional));

  const str = (key: string) => (args[key] == null ? "" : String(args[key]));
  const set = (key: string, value: unknown) => (args[key] = value);

  /** Short string options read best as a segmented control; anything else is a `<select>`. */
  function segmented(control: Control & { type: "select" }): string[] | null {
    const labels = control.options.map((o) => optionOf(o));
    if (labels.some((o) => typeof o.key !== "string")) return null;
    const length = labels.reduce((n, o) => n + o.label.length, 0);
    return labels.length <= 4 && length <= 26 ? labels.map((o) => String(o.key)) : null;
  }

  function selectValue(control: Control & { type: "select" }, raw: string) {
    const option = control.options.map(optionOf).find((o) => String(o.key) === raw);
    return option?.key;
  }

  /** `<input type="color">` only speaks `#rrggbb`. */
  const hex = (value: string) => (/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000");
</script>

<div class="controls">
  {#each controls as [key, control] (key)}
    <div class="name">
      <span class="mono" use:tooltip={control.note ?? null}>{key}</span>
      {#if control.pseudo}<span class="faint" use:tooltip={"Not a prop: shapes the preview"}>*</span
        >{/if}
    </div>
    <div class="input">
      {#if control.type === "text"}
        {#if control.multiline}
          <textarea
            class="field-input"
            rows="3"
            aria-label={key}
            value={str(key)}
            oninput={(e) => set(key, e.currentTarget.value)}></textarea>
        {:else}
          <input
            class="field-input"
            aria-label={key}
            placeholder={control.optional ? "unset" : ""}
            value={str(key)}
            oninput={(e) => set(key, e.currentTarget.value)}
          />
        {/if}
      {:else if control.type === "number"}
        <input
          class="field-input"
          type="number"
          aria-label={key}
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          placeholder={control.optional ? "unset" : ""}
          value={str(key)}
          oninput={(e) =>
            set(key, e.currentTarget.value === "" ? undefined : Number(e.currentTarget.value))}
        />
      {:else if control.type === "boolean"}
        <Switch
          label={key}
          bind:checked={() => Boolean(args[key]), (on: boolean) => set(key, on)}
        />
      {:else if control.type === "select"}
        {@const ids = segmented(control)}
        {#if ids}
          <Segmented
            label={key}
            size="sm"
            options={ids.map((id) => ({ id, label: id }))}
            bind:value={() => str(key), (id: string) => set(key, selectValue(control, id))}
          />
        {:else}
          <select
            class="field-input"
            aria-label={key}
            value={str(key)}
            onchange={(e) => set(key, selectValue(control, e.currentTarget.value))}
          >
            {#each control.options.map(optionOf) as option (option.key)}
              <option value={String(option.key)}>{option.label}</option>
            {/each}
          </select>
        {/if}
      {:else if control.type === "color"}
        <span class="color">
          <input
            type="color"
            aria-label="{key}, picker"
            value={hex(str(key))}
            oninput={(e) => set(key, e.currentTarget.value)}
          />
          <input
            class="field-input"
            aria-label={key}
            placeholder={control.optional ? "unset" : ""}
            value={str(key)}
            oninput={(e) => set(key, e.currentTarget.value)}
          />
        </span>
      {:else if control.type === "icon"}
        {@const Icon = ICONS[str(key)]}
        <span class="color">
          <span class="glyph"
            >{#if Icon}<Icon />{/if}</span
          >
          <select
            class="field-input"
            aria-label={key}
            value={str(key)}
            onchange={(e) => set(key, e.currentTarget.value || undefined)}
          >
            {#if control.optional}<option value="">none</option>{/if}
            {#each ICON_NAMES as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </span>
      {/if}
    </div>
  {/each}
  {#each optionalEvents as [name] (name)}
    <div class="name"><span class="mono">{name}</span></div>
    <div class="input">
      <Checkbox
        label="pass a handler"
        bind:checked={() => Boolean(args[name]), (on: boolean) => set(name, on)}
      />
    </div>
  {/each}
</div>

<style>
  .controls {
    display: grid;
    grid-template-columns: minmax(80px, max-content) minmax(0, 1fr);
    align-items: center;
    gap: var(--sp-3) var(--sp-5);
  }
  .name {
    display: flex;
    gap: var(--gap-2);
    min-width: 0;
    font-size: var(--fs-sm);
    color: var(--color2);
    overflow-wrap: anywhere;
  }
  .input {
    display: flex;
    min-width: 0;
  }
  .input > :global(.field-input) {
    width: 100%;
  }
  textarea {
    resize: vertical;
  }
  .color {
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    width: 100%;
    min-width: 0;
  }
  .color .field-input {
    flex: 1;
  }
  input[type="color"] {
    flex: none;
    width: calc(var(--swatch) + var(--sp-3));
    height: calc(var(--swatch) + var(--sp-3));
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: none;
    cursor: pointer;
  }
  .glyph {
    display: grid;
    place-items: center;
    flex: none;
    width: var(--btn);
    font-size: var(--icon-lg);
    color: var(--color2);
  }
</style>
