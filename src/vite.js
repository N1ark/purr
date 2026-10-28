// @ts-check
/// <reference types="node" />
// The `purr()` Vite plugin, for an app's `vite.config`. Plain JavaScript typed by JSDoc (types for
// apps are in `vite.d.ts`): Node loads it from `node_modules`, where it will not strip types.
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {import("vite").Plugin} Plugin */
/** @typedef {import("./vite").PurrOptions} PurrOptions */
/** @typedef {import("./vite").PurrPlugin} PurrPlugin */
/** @typedef {(name: string) => string | null} Lookup */

export const DEFAULT_WEIGHTS = ["regular", "bold", "fill"];

/** Purr's real directory, wherever the app's `node_modules/purr` link points. */
const PURR_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const ICONS_DIR = join(PURR_ROOT, "src", "icons");
/** The real module behind `purr/glyphs`, which the plugin fills with every glyph when imported whole. */
const GLYPHS_FILE = join(PURR_ROOT, "src", "glyphs.js").replace(/\\/g, "/");

/** Packages purr and the app both import: one copy, the app's when it has one. */
const SHARED = ["phosphor-svelte", "@fontsource-variable/inter", "@fontsource/fira-code"];

const SOURCE_RE = /\.(?:[cm]?[jt]sx?|svelte)$/;
const PHOSPHOR_ICON_RE = /[/\\]phosphor-svelte[/\\]lib[/\\][A-Za-z0-9]+\.svelte$/;
// Only a statement at the start of a line: the same words inside a string are left alone.
const ICON_IMPORT_RE =
  /^([ \t]*)import\s*(type\s+)?\{([^}]*)\}\s*from\s*(["'])purr\/icons\4\s*;?/gm;

const GLYPH_IMPORT_RE =
  /^([ \t]*)(import|export)\s*(type\s+)?\{([^}]*)\}\s*from\s*(["'])purr\/glyphs\5\s*;?/gm;
const GLYPH_PREFIX = "virtual:purr-glyph/";
/** Where a glyph of several shapes is compiled from: no file, but a `.svelte` id the svelte plugin takes. */
const GLYPH_SVELTE_DIR = join(PURR_ROOT, "src", "icons", "glyphs").replace(/\\/g, "/");
/** The factory every glyph module calls, by its real path so all of them share one copy. */
const GLYPH_FACTORY = join(PURR_ROOT, "src", "icons", "glyph.ts").replace(/\\/g, "/");

/** Every weight, with the suffix that names a glyph of that weight alone (`StarFill`). */
export const GLYPH_WEIGHTS = {
  regular: "Regular",
  thin: "Thin",
  light: "Light",
  bold: "Bold",
  fill: "Fill",
  duotone: "Duotone",
};

/** Purr's own icons, as `index.ts` exports them: export name → file. */
/**
 * @param {string} indexSource
 * @param {string} dir
 * @returns {Map<string, string>}
 */
export function customIcons(indexSource, dir) {
  /** @type {Map<string, string>} */
  const icons = new Map();
  for (const m of indexSource.matchAll(
    /export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*["']\.\/([\w.-]+\.svelte)["']/g,
  ))
    icons.set(m[1], join(dir, m[2]));
  return icons;
}

/**
 * Rewrites `import { A, B as C } from "purr/icons"` into one default import per icon, so dev loads
 * the icons a file uses rather than all of Phosphor. `lookup` gives an icon's module specifier, or
 * null for a name that is not an icon file (a type, `IconContext`), which stays a named import.
 * @param {string} code
 * @param {Lookup} lookup
 * @returns {string | null}
 */
export function rewriteIconImports(code, lookup) {
  if (!code.includes("purr/icons")) return null;
  let changed = false;
  const out = code.replace(
    ICON_IMPORT_RE,
    /** @type {(whole: string, lead: string, typeOnly: string | undefined, list: string) => string} */ (
      (whole, lead, typeOnly, list) => {
        if (typeOnly) return whole;
        /** @type {string[]} */
        const lines = [];
        /** @type {string[]} */
        const kept = [];
        for (const raw of list.split(",")) {
          const spec = raw.trim();
          if (!spec) continue;
          const m = /^(type\s+)?([\w$]+)(?:\s+as\s+([\w$]+))?$/.exec(spec);
          const target = m && !m[1] ? lookup(m[2]) : null;
          if (!m || !target) {
            kept.push(spec);
            continue;
          }
          lines.push(`import ${m[3] ?? m[2]} from ${JSON.stringify(target)};`);
        }
        if (!lines.length) return whole;
        changed = true;
        if (kept.length) lines.push(`import { ${kept.join(", ")} } from "purr/icons";`);
        return lead + lines.join(" ");
      }
    ),
  );
  return changed ? out : null;
}

/**
 * Every Phosphor module a file will import once its `purr/icons` imports are rewritten.
 * @param {string} code
 * @param {Lookup} lookup
 * @returns {string[]}
 */
export function iconDepsIn(code, lookup) {
  /** @type {Set<string>} */
  const deps = new Set();
  for (const m of code.matchAll(/["'](phosphor-svelte\/lib\/\w+)["']/g)) deps.add(m[1]);
  for (const m of code.matchAll(ICON_IMPORT_RE)) {
    if (m[2]) continue;
    for (const raw of m[3].split(",")) {
      const name = /^([\w$]+)/.exec(raw.trim())?.[1];
      const target = name && !raw.trim().startsWith("type ") ? lookup(name) : null;
      if (target?.startsWith("phosphor-svelte/")) deps.add(target);
    }
  }
  return [...deps];
}

/**
 * A glyph's icon and weight: `StarFill` is Star's fill alone, and `Star` (weight null) Star at
 * each of the app's weights. A name that is an icon of its own wins over a weight's suffix.
 * @param {string} name
 * @param {(icon: string) => boolean} exists
 * @returns {{ icon: string, weight: string | null } | null}
 */
export function parseGlyph(name, exists) {
  if (exists(name)) return { icon: name, weight: null };
  const m = /^(\w+?)(Regular|Thin|Light|Bold|Fill|Duotone)$/.exec(name);
  return m && exists(m[1]) ? { icon: m[1], weight: m[2].toLowerCase() } : null;
}

/**
 * An icon's shapes as glyph data: a lone bare path's `d`, else the markup, without the blank square
 * every icon starts with, comments or the space between tags.
 * @param {string} markup
 * @returns {string}
 */
export function glyphFromMarkup(markup) {
  const html = markup
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<rect width="256" height="256" fill="none"\s*\/?>(?:<\/rect>)?/, "")
    .replace(/>\s+</g, "><")
    .trim();
  return /^<path d="([^"]*)"\s*\/?>(?:<\/path>)?$/.exec(html)?.[1] ?? html;
}

/**
 * One weight of a Phosphor icon, from its source, as glyph data; null for a weight it lacks.
 * @param {string} source
 * @param {string} weight
 * @returns {string | null}
 */
export function phosphorGlyph(source, weight) {
  const m = new RegExp(`\\{(?:#if|:else if) weight === "${weight}"\\}([\\s\\S]*?)\\{:else`).exec(
    source,
  );
  return m ? glyphFromMarkup(m[1]) : null;
}

/**
 * Rewrites `import { Star, StarFill as On } from "purr/glyphs"` (or `export { … } from`) into one
 * module per glyph, holding that glyph's data alone. Types go, as they would anyway; a name that
 * is no glyph is an error here rather than a missing export in the browser.
 * @param {string} code
 * @param {(name: string) => boolean} has
 * @returns {string | null}
 */
export function rewriteGlyphImports(code, has) {
  if (!code.includes("purr/glyphs")) return null;
  let changed = false;
  const out = code.replace(
    GLYPH_IMPORT_RE,
    /** @type {(whole: string, lead: string, kind: string, typeOnly: string | undefined, list: string) => string} */ (
      (whole, lead, kind, typeOnly, list) => {
        if (typeOnly) return whole;
        /** @type {string[]} */
        const lines = [];
        for (const raw of list.split(",")) {
          const spec = raw.trim();
          if (!spec || /^type\s/.test(spec)) continue;
          const m = /^([\w$]+)(?:\s+as\s+([\w$]+))?$/.exec(spec);
          if (!m || !has(m[1])) throw new Error(`purr/glyphs has no glyph "${spec}"`);
          const from = JSON.stringify(GLYPH_PREFIX + m[1]);
          const local = m[2] ?? m[1];
          lines.push(
            kind === "import"
              ? `import ${local} from ${from};`
              : `export { default as ${local} } from ${from};`,
          );
        }
        changed = true;
        return lead + lines.join(" ");
      }
    ),
  );
  return changed ? out : null;
}

/**
 * The icons in Phosphor's `lib`, by name: one file each, beside its `Icon`-suffixed twin.
 * @param {string} lib
 * @returns {string[]}
 */
export function phosphorIcons(lib) {
  return readdirSync(lib)
    .filter((f) => /^[A-Z]\w*\.svelte$/.test(f) && !/Icon\.svelte$|^IconContext\./.test(f))
    .map((f) => f.slice(0, -".svelte".length))
    .sort();
}

/**
 * A glyph's module: its data at each weight it draws, handed to `pathGlyph()` (or, for markup a
 * template cannot hold, `glyph()`).
 * @param {Record<string, string>} weights
 * @param {string} factory
 * @returns {string}
 */
export function glyphModule(weights, factory) {
  const make = Object.values(weights).every((d) => d[0] !== "<") ? "pathGlyph" : "glyph";
  return `import { ${make} } from ${JSON.stringify(factory)};\nexport default /* @__PURE__ */ ${make}(${JSON.stringify(weights)});\n`;
}

/**
 * A glyph of several shapes (purr's own, a duotone) as a component of its own: its markup compiled
 * into the template, so a mount clones it rather than parsing it as `glyph()` would.
 * @param {Record<string, string>} weights
 * @returns {string | null} null for markup a template cannot hold as is
 */
export function glyphSvelte(weights) {
  const entries = Object.entries(weights);
  if (!entries.length || entries.some(([, d]) => /[{}]/.test(d))) return null;
  const markup = (/** @type {string} */ d) => (d[0] === "<" ? d : `<path d="${d}"/>`);
  const fallback = weights.regular !== undefined ? "regular" : entries[0][0];
  const others = entries.filter(([w]) => w !== fallback);
  const body = others.length
    ? `${others.map(([w, d], i) => `{${i ? ":else " : "#"}if weight === "${w}"}${markup(d)}`).join("")}{:else}${markup(weights[fallback])}{/if}`
    : markup(weights[fallback]);
  return `<script>
  let { ${others.length ? "weight, " : ""}size = "1em", color, mirrored = false, class: className, "aria-label": label, "aria-hidden": hidden } = $props();
</script>

<svg class={className} width={size} height={size} viewBox="0 0 256 256" fill="currentColor" style:color transform={mirrored ? "scale(-1, 1)" : undefined} role={label ? "img" : undefined} aria-label={label} aria-hidden={hidden ?? (label ? undefined : "true")}>${body}</svg>
`;
}

/**
 * `glyphs.d.ts`: every icon, bare and at each weight, one line an icon.
 * @param {readonly string[]} icons
 * @returns {string}
 */
export function glyphDeclarations(icons) {
  const suffixes = Object.values(GLYPH_WEIGHTS);
  return [
    "// Generated by `npm run glyphs` from Phosphor and purr's own icons; `purr()` serves the data.",
    'import type { GlyphComponent as G } from "./components/types";',
    'export type { GlyphComponent, GlyphProps } from "./components/types";',
    ...icons.map(
      (icon) =>
        `export declare const ${["", ...suffixes].map((s) => `${icon}${s}: G`).join(", ")};`,
    ),
    "",
  ].join("\n");
}

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "target",
  "src-tauri",
  ".git",
  ".svelte-kit",
]);

/**
 * Source files under `dir`, skipping dependencies and build output.
 * @param {string} dir
 * @param {string[]} [out]
 * @returns {string[]}
 */
function sourceFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name) && !e.name.startsWith(".") && !e.name.startsWith("dist-"))
        sourceFiles(join(dir, e.name), out);
    } else if (SOURCE_RE.test(e.name) && !e.name.includes(".test.")) out.push(join(dir, e.name));
  }
  return out;
}

/**
 * Cuts the branches of a Phosphor icon that draw weights the app never asks for.
 * @param {string} code
 * @param {readonly string[]} weights
 * @returns {string}
 */
export function trimWeights(code, weights) {
  return code
    .replace(/\{#if weight === "(\w+)"\}[\s\S]*?(?=\{:else)/, (m, /** @type {string} */ w) =>
      weights.includes(w) ? m : "{#if false}",
    )
    .replace(/\{:else if weight === "(\w+)"\}[\s\S]*?(?=\{:else)/g, (m, /** @type {string} */ w) =>
      weights.includes(w) ? m : "",
    );
}

/**
 * The nearest directory at or above `from` whose `node_modules` holds `pkg`.
 * @param {string} pkg
 * @param {string} from
 * @returns {string | null}
 */
function findPackage(pkg, from) {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", pkg);
    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);
    if (dirname(dir) === dir) return null;
  }
}

/**
 * Vite's own rule for the default `server.fs.allow`, without importing Vite at config time.
 * @param {string} root
 * @returns {string}
 */
function workspaceRoot(root) {
  /** @type {string | null} */
  let fallback = null;
  for (let dir = root; ; dir = dirname(dir)) {
    const pkg = join(dir, "package.json");
    if (["pnpm-workspace.yaml", "lerna.json"].some((f) => existsSync(join(dir, f)))) return dir;
    if (existsSync(pkg)) {
      fallback ??= dir;
      try {
        if (JSON.parse(readFileSync(pkg, "utf8")).workspaces) return dir;
      } catch {
        // An unreadable package.json is not a workspace root.
      }
    }
    if (dirname(dir) === dir) return fallback ?? root;
  }
}

/**
 * Wires purr into an app: `plugins: [purr(), svelte()]`.
 * @param {PurrOptions} [options]
 * @returns {PurrPlugin[]}
 */
export function purr(options = {}) {
  const weights = options.weights ?? DEFAULT_WEIGHTS;
  const icons = customIcons(readFileSync(join(ICONS_DIR, "index.ts"), "utf8"), ICONS_DIR);
  let phosphorLib = join(PURR_ROOT, "node_modules", "phosphor-svelte", "lib");
  /** Shared packages the app lacks, resolved from purr's own `node_modules` instead. */
  /** @type {Set<string>} */
  let fromPurr = new Set();

  const ownGlyphs = /** @type {Record<string, Record<string, string>>} */ (
    JSON.parse(readFileSync(join(ICONS_DIR, "glyphs.json"), "utf8"))
  );
  /** @param {string} icon */
  const isIcon = (icon) =>
    Object.hasOwn(ownGlyphs, icon) ||
    (/^[A-Z]\w*$/.test(icon) &&
      !/Icon$|^IconContext$/.test(icon) &&
      existsSync(join(phosphorLib, `${icon}.svelte`)));
  /** @param {string} name */
  const isGlyph = (name) => parseGlyph(name, isIcon) !== null;
  /**
   * An icon's data at the weights asked for, those it has.
   * @param {string} icon
   * @param {readonly string[]} at
   * @returns {Record<string, string>}
   */
  const dataOf = (icon, at) => {
    const own = ownGlyphs[icon];
    const source = own ? "" : readFileSync(join(phosphorLib, `${icon}.svelte`), "utf8");
    /** @type {Record<string, string>} */
    const out = {};
    for (const weight of at) {
      const data = own ? own[weight] : phosphorGlyph(source, weight);
      if (data) out[weight] = data;
    }
    return out;
  };
  /** Every glyph, for an import of `purr/glyphs` the plugin cannot split: a namespace import. */
  const allGlyphs = () => {
    /** @type {string[]} */
    const lines = [`import { glyph } from ${JSON.stringify(GLYPH_FACTORY)};`];
    const make = (/** @type {Record<string, string>} */ data) =>
      `/* @__PURE__ */ glyph(${JSON.stringify(data)})`;
    for (const icon of [...Object.keys(ownGlyphs), ...phosphorIcons(phosphorLib)]) {
      const all = dataOf(icon, Object.keys(GLYPH_WEIGHTS));
      const bare = Object.fromEntries(weights.filter((w) => all[w]).map((w) => [w, all[w]]));
      lines.push(`export const ${icon} = ${make(bare)};`);
      for (const [weight, suffix] of Object.entries(GLYPH_WEIGHTS))
        lines.push(`export const ${icon}${suffix} = ${make({ [weight]: all[weight] })};`);
    }
    return lines.join("\n");
  };

  /** @type {Lookup} */
  const lookup = (name) => {
    const own = icons.get(name);
    if (own) return own;
    // `XIcon` is a copy of `X`: one module for both, so an app that names both ships one.
    const base = name.endsWith("Icon") && isIcon(name.slice(0, -4)) ? name.slice(0, -4) : name;
    return existsSync(join(phosphorLib, `${base}.svelte`)) ? `phosphor-svelte/lib/${base}` : null;
  };

  /** @type {Plugin} */
  const config = {
    name: "purr:config",
    config(user, env) {
      const root = resolve(user.root ?? process.cwd());
      const inApp = SHARED.filter((pkg) => findPackage(pkg, root));
      fromPurr = new Set(SHARED.filter((pkg) => !inApp.includes(pkg)));
      const phosphor =
        findPackage("phosphor-svelte", root) ?? findPackage("phosphor-svelte", PURR_ROOT);
      if (phosphor) phosphorLib = join(phosphor, "lib");
      // Declared up front: the scanner reads imports before they are rewritten, and finding the
      // icons only as the page loads would re-bundle them and reload the page on a cold start.
      /** @type {Set<string>} */
      const include = new Set();
      if (env.command === "serve")
        for (const file of [...sourceFiles(root), ...sourceFiles(join(PURR_ROOT, "src"))])
          for (const dep of iconDepsIn(readFileSync(file, "utf8"), lookup))
            // An app without its own copy names purr's, or Vite cannot resolve it from the root.
            include.add(fromPurr.has("phosphor-svelte") ? `purr > ${dep}` : dep);
      return {
        resolve: { dedupe: inApp },
        server: { fs: { allow: [workspaceRoot(root), PURR_ROOT] } },
        // Purr is source with runes in it; the app's svelte plugin compiles it file by file.
        optimizeDeps: { exclude: ["purr"], include: [...include] },
      };
    },
    async resolveId(id, importer, opts) {
      // The dependency scanner reads source before any transform, so it would crawl the icon
      // barrel into all of Phosphor; the rewritten per-icon imports are discovered instead.
      if (
        (id === "purr/icons" || id === "purr/glyphs") &&
        /** @type {{ scan?: boolean }} */ (opts).scan
      )
        return { id, external: true };
      const pkg = SHARED.find((p) => id === p || id.startsWith(`${p}/`));
      if (!pkg || !fromPurr.has(pkg)) return null;
      return this.resolve(id, join(PURR_ROOT, "src", "index.ts"), { ...opts, skipSelf: true });
    },
  };

  /** @type {Plugin} */
  const iconImports = {
    name: "purr:icon-imports",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("?") || !SOURCE_RE.test(id) || id.includes("/node_modules/")) return null;
      const icons = rewriteIconImports(code, lookup);
      const out = rewriteGlyphImports(icons ?? code, isGlyph) ?? icons;
      return out === null ? null : { code: out, map: null };
    },
  };

  /** @type {Plugin} */
  /** @type {Map<string, Record<string, string>>} */
  const glyphData = new Map();
  /** @param {string} name */
  const dataFor = (name) => {
    let data = glyphData.get(name);
    if (!data) {
      const glyph = parseGlyph(name, isIcon);
      data = glyph ? dataOf(glyph.icon, glyph.weight ? [glyph.weight] : weights) : {};
      if (!Object.keys(data).length) throw new Error(`purr/glyphs has no glyph "${name}"`);
      glyphData.set(name, data);
    }
    return data;
  };

  /** @type {Plugin} */
  const glyphs = {
    name: "purr:glyphs",
    enforce: "pre",
    resolveId(id) {
      if (!id.startsWith(GLYPH_PREFIX)) return null;
      // One path is data for `glyph()`; several shapes become a component the svelte plugin compiles.
      const name = id.slice(GLYPH_PREFIX.length);
      const data = dataFor(name);
      const paths = Object.values(data).every((d) => d[0] !== "<");
      return paths || !glyphSvelte(data) ? `\0${id}` : `${GLYPH_SVELTE_DIR}/${name}.svelte`;
    },
    load(id) {
      if (id.startsWith(`\0${GLYPH_PREFIX}`))
        return glyphModule(dataFor(id.slice(GLYPH_PREFIX.length + 1)), GLYPH_FACTORY);
      const file = id.replace(/\\/g, "/");
      if (file.startsWith(`${GLYPH_SVELTE_DIR}/`) && file.endsWith(".svelte"))
        return glyphSvelte(dataFor(file.slice(GLYPH_SVELTE_DIR.length + 1, -".svelte".length)));
      return file === GLYPHS_FILE ? allGlyphs() : null;
    },
  };

  // A `load` rather than a transform, so it holds whichever order the svelte plugin is listed in.
  /** @type {Plugin} */
  const phosphorWeights = {
    name: "purr:phosphor-weights",
    enforce: "pre",
    load(id) {
      if (id.includes("?") || !PHOSPHOR_ICON_RE.test(id)) return null;
      return trimWeights(readFileSync(id, "utf8"), weights);
    },
  };

  // Spread into plain objects, which (unlike the `Plugin` interface) satisfy `PurrPlugin`.
  return [{ ...config }, { ...iconImports }, { ...glyphs }, { ...phosphorWeights }];
}

export default purr;
