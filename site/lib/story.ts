// The story format: one `stories/<name>.ts` per component, read by `Story.svelte`, which builds
// the controls, the live preview, the event log and the code snippet from it.
import type { Component } from "svelte";

export type Args = Record<string, unknown>;

/** A select option whose value is not a plain string or number: a picture, a list. */
export interface Choice {
  label: string;
  value: unknown;
  /** How the snippet writes it (`{picture}`); without it the prop is left out. */
  code?: string;
}

interface ControlBase {
  /** One line under the control's name. */
  note?: string;
  /** Drives the preview through `props`, but is no prop itself: never passed, never in the code. */
  pseudo?: boolean;
  /** Always written in the snippet, even at its default: a prop the component cannot do without. */
  required?: boolean;
}

export type Control = ControlBase &
  (
    | { type: "text"; default?: string; value?: string; multiline?: boolean; optional?: boolean }
    | {
        type: "number";
        default?: number;
        value?: number;
        min?: number;
        max?: number;
        step?: number;
        optional?: boolean;
      }
    | { type: "boolean"; default?: boolean; value?: boolean }
    | {
        type: "select";
        options: readonly (string | number | Choice)[];
        default?: string | number;
        value?: string | number;
      }
    | { type: "color"; default?: string; value?: string; optional?: boolean }
    | { type: "icon"; default?: string; value?: string; optional?: boolean }
  );

export interface EventSpec {
  /** The handler's name in the snippet (`onclick={save}`); without it the event is left out. */
  handler?: string;
  /** Passed only while its checkbox is on: a callback whose presence changes the component. */
  optional?: boolean;
  /** An optional event's starting state. */
  on?: boolean;
  /** Folds the call back into the controls, for a prop the component changes itself. */
  sync?: (args: Args, ...params: any[]) => Args | void;
  /** The prop `sync` keeps up to date: the snippet writes `bind:<prop>`. */
  bind?: string;
}

export type Group = "Controls" | "Forms" | "Display" | "Layout" | "Overlays & menus" | "Lists";

/** What a story's own preview component is given. */
export interface PreviewProps {
  /** The controls' raw values. */
  args: Args;
  /** Ready to spread: the controls' values as props, fixed `props` and the logged events. */
  props: Args;
  /** The logged event handlers, by name, for a preview that wires them itself. */
  on: Record<string, (...params: any[]) => void>;
  set: (patch: Args) => void;
}

export interface Example {
  title: string;
  args: Args;
}

export interface Story {
  title: string;
  group: Group;
  /** The page's address; `title` in kebab case by default. */
  slug?: string;
  /** The export's name, for the import line and the snippet; `title` by default. */
  name?: string;
  component?: Component<any, any>;
  description: string;
  /** Where it lives in the repo; `src/components/<name>.svelte` by default. */
  source?: string;
  controls?: Record<string, Control>;
  /** Controls that make up the content rather than props: `<Button><Gear /> Save</Button>`. */
  children?: { text?: string; icon?: string; tag?: "p" };
  /** Props the controls cannot express: data, or values computed from pseudo-controls. */
  props?: Args | ((args: Args) => Args);
  /** How `props` appear in the snippet: `{ people: "people" }` writes `{people}`. */
  propsCode?: Record<string, string> | ((args: Args) => Record<string, string>);
  /** Markup inside the element in the snippet, after the children: `{#snippet actions()}…`. */
  inner?: (args: Args) => string;
  /** More names the snippet imports, from purr and from purr/icons: what `inner` uses. */
  uses?: string[];
  usesIcons?: string[];
  events?: Record<string, EventSpec | string | true>;
  /** Rendered behind an "Open" button; `close` is the callback that hides it again. */
  overlay?: { close: string; open?: string };
  /** The preview's width, for fields and lists that would otherwise shrink to their content. */
  width?: string;
  /** Replaces the generic rendering, for components that need children or an anchor. */
  preview?: Component<PreviewProps>;
  /** Replaces the generated snippet. */
  code?: (args: Args) => string;
  /** Fixed states, rendered with the story's own controls; "Try" loads them into the controls. */
  examples?: Example[];
  /** Richer fixed examples than `examples` can describe. */
  demo?: Component;
  /** Words the sidebar filter also matches. */
  keywords?: string[];
}

export const defineStory = (story: Story): Story => story;

export function slugOf(title: string): string {
  return title
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function eventSpecs(story: Story): [string, EventSpec][] {
  return Object.entries(story.events ?? {}).map(([name, spec]) => [
    name,
    spec === true ? {} : typeof spec === "string" ? { handler: spec } : spec,
  ]);
}

/** The value a control starts at. */
export function initialOf(control: Control): unknown {
  return control.value ?? control.default;
}

export function initialArgs(story: Story): Args {
  const args: Args = {};
  for (const [key, control] of Object.entries(story.controls ?? {})) args[key] = initialOf(control);
  for (const [name, spec] of eventSpecs(story)) if (spec.optional) args[name] = spec.on ?? false;
  return args;
}

/** A select option's key (what the control holds), label and value. */
export function optionOf(option: string | number | Choice): {
  key: string | number;
  label: string;
  value: unknown;
  code?: string;
} {
  if (typeof option === "object")
    return { key: option.label, label: option.label, value: option.value, code: option.code };
  return { key: option, label: String(option), value: option };
}

/** Is a control's raw value "nothing", so the prop is not passed at all? */
export function isUnset(control: Control, raw: unknown): boolean {
  if (raw === undefined || raw === null) return true;
  if ("optional" in control && control.optional && raw === "") return true;
  return false;
}
