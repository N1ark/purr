// Writes the Svelte a story's current controls stand for: imports, then the element.
import { eventSpecs, isUnset, optionOf, type Args, type Control, type Story } from "./story";

const WIDTH = 90;

/** A value as an attribute: `name="text"`, `name={3}`, `name`. Null leaves it out. */
export function attribute(name: string, control: Control, raw: unknown): string | null {
  if (isUnset(control, raw)) return null;
  // A boolean prop is off unless said otherwise.
  const fallback = control.type === "boolean" ? (control.default ?? false) : control.default;
  if (control.type !== "select" && raw === fallback && !control.required) return null;
  switch (control.type) {
    case "boolean":
      return raw ? name : `${name}={false}`;
    case "number":
      return `${name}={${raw}}`;
    case "icon":
      return `${name}={${raw}}`;
    case "select": {
      const option = control.options.map(optionOf).find((o) => o.key === raw);
      if (!option || option.key === control.default) return null;
      if (typeof option.value === "string") return text(name, option.value);
      if (typeof option.value === "number") return `${name}={${option.value}}`;
      if (option.value === undefined) return null;
      return option.code ? expression(name, option.code) : null;
    }
    default:
      return text(name, String(raw));
  }
}

function text(name: string, value: string): string {
  return /["{}\n]/.test(value) ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`;
}

/** `{name}` when the expression is the name itself, as Svelte allows. */
function expression(name: string, code: string): string {
  return code === name ? `{${name}}` : `${name}={${code}}`;
}

/** `<Name a="b">children</Name>`, on one line when it fits and one attribute per line otherwise. */
export function element(name: string, attrs: readonly string[], children = ""): string {
  const open = [name, ...attrs].join(" ");
  const oneLine = children ? `<${open}>${children}</${name}>` : `<${open} />`;
  if (oneLine.length <= WIDTH && !children.includes("\n")) return oneLine;
  const head = attrs.length ? `<${name}\n${attrs.map((a) => `  ${a}`).join("\n")}\n` : `<${name}`;
  if (!children) return `${head}${attrs.length ? "/>" : " />"}`;
  return `${head}>\n${indent(children)}\n</${name}>`;
}

export function indent(text: string, by = "  "): string {
  return text
    .split("\n")
    .map((line) => (line ? by + line : line))
    .join("\n");
}

/** The `<script>` block importing what the markup uses. */
export function imports(fromPurr: readonly string[], icons: readonly string[] = []): string {
  const lines: string[] = [];
  const sorted = (names: readonly string[]) => [...new Set(names)].sort().join(", ");
  if (fromPurr.length) lines.push(`  import { ${sorted(fromPurr)} } from "purr";`);
  if (icons.length) lines.push(`  import { ${sorted(icons)} } from "purr/icons";`);
  return lines.length ? `<script lang="ts">\n${lines.join("\n")}\n</script>` : "";
}

/** The snippet for a story at `args`. */
export function storyCode(story: Story, args: Args): string {
  if (story.code) return story.code(args);
  const name = story.name ?? story.title;
  const icons: string[] = [];
  const attrs: string[] = [];
  const content = new Set([story.children?.text, story.children?.icon]);
  const bound = new Set(eventSpecs(story).flatMap(([, spec]) => (spec.bind ? [spec.bind] : [])));

  for (const [key, control] of Object.entries(story.controls ?? {})) {
    if (control.pseudo || content.has(key)) continue;
    if (bound.has(key)) {
      attrs.push(`bind:${key}`);
      continue;
    }
    const attr = attribute(key, control, args[key]);
    if (!attr) continue;
    attrs.push(attr);
    if (control.type === "icon") icons.push(String(args[key]));
  }
  for (const [key, code] of Object.entries(story.propsCode ?? {}))
    attrs.push(expression(key, code));
  for (const [event, spec] of eventSpecs(story)) {
    if (spec.optional && !args[event]) continue;
    if (story.overlay?.close === event) attrs.push(`${event}={() => (open = false)}`);
    else if (spec.handler) attrs.push(expression(event, spec.handler));
  }

  const parts: string[] = [];
  const icon = story.children?.icon ? args[story.children.icon] : undefined;
  if (typeof icon === "string" && icon) {
    icons.push(icon);
    parts.push(`<${icon} />`);
  }
  const words = story.children?.text ? String(args[story.children.text] ?? "") : "";
  if (words) parts.push(story.children?.tag ? `<p>${words}</p>` : words);
  let inside = parts.join(" ");
  const more = story.inner?.(args);
  if (more) inside = inside ? `${inside}\n${more}` : more;

  let markup = element(name, attrs, inside);
  if (story.overlay) markup = `{#if open}\n${indent(markup)}\n{/if}`;
  return [imports([name, ...(story.uses ?? [])], [...icons, ...(story.usesIcons ?? [])]), markup]
    .filter(Boolean)
    .join("\n\n");
}
