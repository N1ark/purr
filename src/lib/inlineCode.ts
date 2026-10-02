/**
 * Inline code that names its language, spelled as rehype-pretty-code does: `` `Vec<u8>{:rust}` ``.
 * Purr does not highlight: an app's markdown renderer splits a code span with this, runs its own
 * highlighter on `code`, and `code.css` colours the spans as it does in a block.
 */

export interface InlineCode {
  code: string;
  /** Lower-cased, as the fence would give it: `rust`, `c++`, `objective-c`. */
  lang: string;
}

const SUFFIX = /^([\s\S]*?)\s*\{:([a-z0-9][\w#+.-]*)\}$/i;

/** The code and its language, or `null` for a span that names none (render it as it is). */
export function inlineCodeLang(text: string): InlineCode | null {
  const m = SUFFIX.exec(text);
  if (!m || !m[1]) return null;
  return { code: m[1], lang: m[2].toLowerCase() };
}
