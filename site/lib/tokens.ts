// Reads `tokens.css` into a table: every custom property, its value in each scope (light, dark,
// the densities, touch) and the comment above it.

export type Scope = "light" | "dark" | "cozy" | "dense" | "mobile";

export type Kind =
  "color" | "shadow" | "radius" | "space" | "type" | "font" | "size" | "motion" | "z" | "plain";

export interface Token {
  name: string;
  values: Partial<Record<Scope, string>>;
  note?: string;
}

export interface Category {
  title: string;
  kind: Kind;
  test: RegExp;
}

const SCOPES: Record<string, Scope> = {
  ":root": "light",
  "html.dark": "dark",
  "html.density-cozy": "cozy",
  "html.density-dense": "dense",
  "body.mobile": "mobile",
};

export const CATEGORIES: Category[] = [
  {
    title: "Surfaces and text",
    kind: "color",
    test: /^--(bg\d?|border(-strong)?|color2?|muted|faint|code-bg|surface|control-[\w-]+|field-[\w-]+|chip)$/,
  },
  { title: "Accent", kind: "color", test: /^--(theme[\w-]*|selection|mention|on-[\w-]+)$/ },
  { title: "Status", kind: "color", test: /^--(danger|success|warn|star|info)$/ },
  { title: "Diffs", kind: "color", test: /^--(add|del)(-\w+)?$/ },
  { title: "Syntax", kind: "color", test: /^--code-(?!bg)/ },
  { title: "Shadows and scrims", kind: "shadow", test: /^--(box-shadow|shadow-\w+|scrim[\w-]*)$/ },
  { title: "Radius", kind: "radius", test: /^--radius/ },
  { title: "Spacing", kind: "space", test: /^--(sp|gap)-\d$/ },
  { title: "Type scale", kind: "type", test: /^--(font-size|line-height|fs-\w+)$/ },
  { title: "Fonts", kind: "font", test: /^--(font|mono)$/ },
  {
    title: "Control sizes",
    kind: "size",
    test: /^--(btn[\w-]*|row-h|badge|avatar|check|swatch|icon-\w+)$/,
  },
  { title: "Motion", kind: "motion", test: /^--(dur|ease)/ },
  { title: "Stacking order", kind: "z", test: /^--z-/ },
  { title: "Insets", kind: "plain", test: /^--(safe-\w+|kb)$/ },
];

const BLOCK = /([^{}]+?)\s*\{([^{}]*)\}/g;
const DECL = /(\/\*(?:(?!\*\/)[\s\S])*\*\/\s*)?(--[\w-]+)\s*:\s*([^;]+);/g;

/** Every custom property in `css`, in source order, with the scopes it is set in. */
export function parseTokens(css: string): Token[] {
  const tokens = new Map<string, Token>();
  for (const block of css.matchAll(BLOCK)) {
    const selector = block[1].replace(/\/\*[\s\S]*?\*\//g, "").trim();
    const scope = SCOPES[selector];
    if (!scope) continue;
    for (const decl of block[2].matchAll(DECL)) {
      const name = decl[2];
      const value = decl[3].replace(/\s+/g, " ").trim();
      const note = decl[1]?.replace(/^\/\*\s*|\s*\*\/\s*$/g, "").replace(/\s+/g, " ");
      let token = tokens.get(name);
      if (!token) {
        token = { name, values: {} };
        tokens.set(name, token);
      }
      token.values[scope] = value;
      if (note && !token.note) token.note = note;
    }
  }
  return [...tokens.values()];
}

/** The tokens under each category heading; anything unmatched comes last, as "Other". */
export function categorise(tokens: readonly Token[]): { category: Category; tokens: Token[] }[] {
  const out = CATEGORIES.map((category) => ({ category, tokens: [] as Token[] }));
  const other: Token[] = [];
  for (const token of tokens) {
    const hit = out.find((c) => c.category.test.test(token.name));
    (hit ? hit.tokens : other).push(token);
  }
  if (other.length)
    out.push({ category: { title: "Other", kind: "plain", test: /$^/ }, tokens: other });
  return out.filter((c) => c.tokens.length);
}
