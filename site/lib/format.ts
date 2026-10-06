// How the events log shows what a callback was called with.

const MAX = 60;

function clip(text: string): string {
  return text.length > MAX ? `${text.slice(0, MAX - 1)}…` : text;
}

/** One argument, briefly: `MouseEvent`, `"text"`, `[1, 2]`, `{ id: "a" }`. */
export function describe(value: unknown, depth = 0): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return clip(JSON.stringify(value));
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return "ƒ";
  if (typeof Event !== "undefined" && value instanceof Event) {
    const key = "key" in value && typeof value.key === "string" ? ` ${value.key}` : "";
    return `${value.constructor.name}${key}`;
  }
  if (typeof Element !== "undefined" && value instanceof Element)
    return `<${value.tagName.toLowerCase()}>`;
  if (depth > 1) return Array.isArray(value) ? "[…]" : "{…}";
  if (Array.isArray(value)) return clip(`[${value.map((v) => describe(v, depth + 1)).join(", ")}]`);
  const fields = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => typeof v !== "function",
  );
  return clip(`{ ${fields.map(([k, v]) => `${k}: ${describe(v, depth + 1)}`).join(", ")} }`);
}

/** A call's arguments, as the log line shows them. */
export function describeCall(params: readonly unknown[]): string {
  return params.map((p) => describe(p)).join(", ");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Prose with `code spans`, as HTML: everything escaped, backticks turned into `<code>`. */
export function inlineCode(text: string): string {
  return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}
