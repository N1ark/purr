// A story's control values turned into props and children, for its page and its thumbnail.
import type { Component } from "svelte";
import { ICONS } from "./icons";
import { eventSpecs, isUnset, optionOf, type Args, type Story } from "./story";

export type Calls = Record<string, (...params: any[]) => void>;

/** The controls' raw values as props, plus the fixed ones and the callbacks. */
export function propsOf(story: Story, values: Args, calls: Calls): Args {
  const content = new Set([story.children?.text, story.children?.icon]);
  const props: Args = {};
  for (const [key, control] of Object.entries(story.controls ?? {})) {
    if (control.pseudo || content.has(key)) continue;
    const raw = values[key];
    if (isUnset(control, raw)) continue;
    if (control.type === "icon") props[key] = ICONS[String(raw)];
    else if (control.type === "select")
      props[key] = control.options.map(optionOf).find((o) => o.key === raw)?.value;
    else props[key] = raw;
  }
  Object.assign(props, typeof story.props === "function" ? story.props(values) : story.props);
  for (const [event, spec] of eventSpecs(story))
    if (!spec.optional || values[event]) props[event] = calls[event];
  return props;
}

export function childrenOf(
  story: Story,
  values: Args,
): { Icon: Component<any> | undefined; text: string } {
  const icon = story.children?.icon ? values[story.children.icon] : undefined;
  const text = story.children?.text ? values[story.children.text] : undefined;
  return { Icon: icon ? ICONS[String(icon)] : undefined, text: text ? String(text) : "" };
}
