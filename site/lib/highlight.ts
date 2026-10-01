// A small highlighter for the snippets: Svelte markup and TypeScript, as highlight.js classes,
// so purr's own `code.css` colours them. Context-free, which is plenty for a few lines.

const RULES: [RegExp, string | ((match: string) => string)][] = [
  [/^(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)/, "hljs-comment"],
  [/^(?:"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)/, "hljs-string"],
  [/^\{[#/:@][a-z]+/, "hljs-keyword"],
  [/^<\/?[A-Za-z][\w.:-]*/, tag],
  [/^\/?>/, "hljs-tag"],
  [/^(?:bind|on|use|class|style|transition):[\w-]+/, "hljs-attr"],
  [/^[\w-]+(?==)/, "hljs-attr"],
  [
    /^(?:import|from|export|const|let|var|function|return|if|else|async|await|new|type|interface|as|of|in|for|while)\b/,
    "hljs-keyword",
  ],
  [/^(?:true|false|null|undefined)\b/, "hljs-literal"],
  [/^\d+(?:\.\d+)?\b/, "hljs-number"],
  [/^[a-z_$][\w$]*(?=\()/, "hljs-title function_"],
  [/^[A-Z][\w$]*/, "hljs-title class_"],
  [/^[\w$]+/, ""],
];

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function span(cls: string, text: string): string {
  return cls ? `<span class="${cls}">${escape(text)}</span>` : escape(text);
}

function tag(match: string): string {
  const at = match.startsWith("</") ? 2 : 1;
  return span("hljs-tag", match.slice(0, at)) + span("hljs-name", match.slice(at));
}

/** The code as HTML, every character escaped. */
export function highlight(code: string): string {
  let out = "";
  let rest = code;
  outer: while (rest) {
    // `createKeymap<Action>(`: a `<` right after a name opens type arguments, not a tag.
    const afterName = /[\w$]$/.test(code.slice(0, code.length - rest.length));
    for (const [re, kind] of RULES) {
      if (afterName && kind === tag) continue;
      const m = re.exec(rest);
      if (!m || !m[0]) continue;
      out += typeof kind === "function" ? kind(m[0]) : span(kind, m[0]);
      rest = rest.slice(m[0].length);
      continue outer;
    }
    out += escape(rest[0]);
    rest = rest.slice(1);
  }
  return out;
}
