/// <reference types="node" />
// The `purr()` Vite plugin, for an app's `vite.config`. Loaded by Node, so it imports nothing
// but Node built-ins at runtime and uses no TypeScript beyond erasable type annotations.
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

export interface PurrOptions {
  /** Phosphor weights the app uses; the others are cut from every icon before it compiles. */
  weights?: string[];
}

export const DEFAULT_WEIGHTS = ["regular", "bold", "fill"];

/** Purr's real directory, wherever the app's `node_modules/purr` link points. */
const PURR_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const ICONS_DIR = join(PURR_ROOT, "src", "icons");

/** Packages purr and the app both import: one copy, the app's when it has one. */
const SHARED = ["phosphor-svelte", "@fontsource-variable/inter", "@fontsource/fira-code"];

const SOURCE_RE = /\.(?:[cm]?[jt]sx?|svelte)$/;
const PHOSPHOR_ICON_RE = /[/\\]phosphor-svelte[/\\]lib[/\\][A-Za-z0-9]+\.svelte$/;
const ICON_IMPORT_RE = /import\s*(type\s+)?\{([^}]*)\}\s*from\s*(["'])purr\/icons\3\s*;?/g;

/** Purr's own icons, as `index.ts` exports them: export name → file. */
export function customIcons(indexSource: string, dir: string): Map<string, string> {
  const icons = new Map<string, string>();
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
 */
export function rewriteIconImports(
  code: string,
  lookup: (name: string) => string | null,
): string | null {
  if (!code.includes("purr/icons")) return null;
  let changed = false;
  const out = code.replace(ICON_IMPORT_RE, (whole, typeOnly: string | undefined, list: string) => {
    if (typeOnly) return whole;
    const lines: string[] = [];
    const kept: string[] = [];
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
    return lines.join(" ");
  });
  return changed ? out : null;
}

/** Every Phosphor module a file will import once its `purr/icons` imports are rewritten. */
export function iconDepsIn(code: string, lookup: (name: string) => string | null): string[] {
  const deps = new Set<string>();
  for (const m of code.matchAll(/["'](phosphor-svelte\/lib\/\w+)["']/g)) deps.add(m[1]);
  for (const m of code.matchAll(ICON_IMPORT_RE)) {
    if (m[1]) continue;
    for (const raw of m[2].split(",")) {
      const name = /^([\w$]+)/.exec(raw.trim())?.[1];
      const target = name && !raw.trim().startsWith("type ") ? lookup(name) : null;
      if (target?.startsWith("phosphor-svelte/")) deps.add(target);
    }
  }
  return [...deps];
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

/** Source files under `dir`, skipping dependencies and build output. */
function sourceFiles(dir: string, out: string[] = []): string[] {
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

/** Cuts the branches of a Phosphor icon that draw weights the app never asks for. */
export function trimWeights(code: string, weights: readonly string[]): string {
  return code
    .replace(/\{#if weight === "(\w+)"\}[\s\S]*?(?=\{:else)/, (m, w: string) =>
      weights.includes(w) ? m : "{#if false}",
    )
    .replace(/\{:else if weight === "(\w+)"\}[\s\S]*?(?=\{:else)/g, (m, w: string) =>
      weights.includes(w) ? m : "",
    );
}

/** The nearest directory at or above `from` whose `node_modules` holds `pkg`. */
function findPackage(pkg: string, from: string): string | null {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", pkg);
    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);
    if (dirname(dir) === dir) return null;
  }
}

/** Vite's own rule for the default `server.fs.allow`, without importing Vite at config time. */
function workspaceRoot(root: string): string {
  let fallback: string | null = null;
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

/** Wires purr into an app: `plugins: [purr(), svelte()]`. */
export function purr(options: PurrOptions = {}): Plugin[] {
  const weights = options.weights ?? DEFAULT_WEIGHTS;
  const icons = customIcons(readFileSync(join(ICONS_DIR, "index.ts"), "utf8"), ICONS_DIR);
  let phosphorLib = join(PURR_ROOT, "node_modules", "phosphor-svelte", "lib");
  /** Shared packages the app lacks, resolved from purr's own `node_modules` instead. */
  let fromPurr = new Set<string>();

  const lookup = (name: string): string | null => {
    const own = icons.get(name);
    if (own) return own;
    return existsSync(join(phosphorLib, `${name}.svelte`)) ? `phosphor-svelte/lib/${name}` : null;
  };

  const config: Plugin = {
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
      const include = new Set<string>();
      if (env.command === "serve")
        for (const file of [...sourceFiles(root), ...sourceFiles(join(PURR_ROOT, "src"))])
          for (const dep of iconDepsIn(readFileSync(file, "utf8"), lookup)) include.add(dep);
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
      if (id === "purr/icons" && (opts as { scan?: boolean }).scan) return { id, external: true };
      const pkg = SHARED.find((p) => id === p || id.startsWith(`${p}/`));
      if (!pkg || !fromPurr.has(pkg)) return null;
      return this.resolve(id, join(PURR_ROOT, "src", "index.ts"), { ...opts, skipSelf: true });
    },
  };

  const iconImports: Plugin = {
    name: "purr:icon-imports",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("?") || !SOURCE_RE.test(id) || id.includes("/node_modules/")) return null;
      const out = rewriteIconImports(code, lookup);
      return out === null ? null : { code: out, map: null };
    },
  };

  // A `load` rather than a transform, so it holds whichever order the svelte plugin is listed in.
  const phosphorWeights: Plugin = {
    name: "purr:phosphor-weights",
    enforce: "pre",
    load(id) {
      if (id.includes("?") || !PHOSPHOR_ICON_RE.test(id)) return null;
      return trimWeights(readFileSync(id, "utf8"), weights);
    },
  };

  return [config, iconImports, phosphorWeights];
}

export default purr;
