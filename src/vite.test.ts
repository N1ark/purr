// @vitest-environment node
/// <reference types="node" />
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  customIcons,
  glyphFromMarkup,
  iconDepsIn,
  parseGlyph,
  glyphModule,
  glyphSvelte,
  phosphorGlyph,
  phosphorIcons,
  purr,
  rewriteGlyphImports,
  rewriteIconImports,
  trimWeights,
} from "./vite";

// Spelled out of parts: the playground config's own `purr()` would otherwise rewrite the fixtures.
const I = ["purr", "icons"].join("/");
const G = ["purr", "glyphs"].join("/");
const V = "virtual:purr-glyph/";
const LIB = new URL("../node_modules/phosphor-svelte/lib/", import.meta.url).pathname;

const lookup = (name: string) =>
  name === "IssueOpened"
    ? "/purr/src/icons/IssueOpened.svelte"
    : ["X", "Gear", "CaretDownIcon", "IconContext"].includes(name)
      ? `phosphor-svelte/lib/${name}`
      : null;

describe("rewriteIconImports", () => {
  it("leaves the same words inside a string alone", () => {
    const code = `const doc = \`import { Gear } from "${I}";\`;\n  import { X } from "${I}";`;
    expect(rewriteIconImports(code, lookup)).toBe(
      `const doc = \`import { Gear } from "${I}";\`;\n  import X from "phosphor-svelte/lib/X";`,
    );
  });

  it("turns named imports into one default import per icon", () => {
    expect(rewriteIconImports(`import { X, Gear } from "${I}";\nfoo();`, lookup)).toBe(
      `import X from "phosphor-svelte/lib/X"; import Gear from "phosphor-svelte/lib/Gear";\nfoo();`,
    );
  });

  it("keeps renames, single quotes and multi-line lists", () => {
    const code = `import {\n  X as Close,\n  CaretDownIcon,\n} from '${I}'`;
    expect(rewriteIconImports(code, lookup)).toBe(
      `import Close from "phosphor-svelte/lib/X"; import CaretDownIcon from "phosphor-svelte/lib/CaretDownIcon";`,
    );
  });

  it("points purr's own icons at their files", () => {
    expect(rewriteIconImports(`import { IssueOpened as Open } from "${I}";`, lookup)).toBe(
      `import Open from "/purr/src/icons/IssueOpened.svelte";`,
    );
  });

  it("leaves types and unknown names as a named import", () => {
    expect(rewriteIconImports(`import { X, type IconWeight, Nope } from "${I}";`, lookup)).toBe(
      `import X from "phosphor-svelte/lib/X"; import { type IconWeight, Nope } from "${I}";`,
    );
  });

  it("leaves type-only imports, other modules and namespace imports alone", () => {
    expect(rewriteIconImports(`import type { IconWeight } from "${I}";`, lookup)).toBeNull();
    expect(rewriteIconImports(`import { X } from "phosphor-svelte";`, lookup)).toBeNull();
    expect(rewriteIconImports(`import * as I from "${I}";`, lookup)).toBeNull();
    expect(rewriteIconImports(`import { Button } from "purr";`, lookup)).toBeNull();
  });

  it("rewrites every import in a file, as in a Svelte script", () => {
    const code = `<script lang="ts">\n  import { X } from "${I}";\n  import { Gear } from "${I}";\n</script>`;
    expect(rewriteIconImports(code, lookup)).toBe(
      `<script lang="ts">\n  import X from "phosphor-svelte/lib/X";\n  import Gear from "phosphor-svelte/lib/Gear";\n</script>`,
    );
  });
});

describe("iconDepsIn", () => {
  it("lists the Phosphor modules a file will import, but not purr's own icons or types", () => {
    const code = `import { X as Close, IssueOpened, type Nope } from "${I}";\nimport Gear from "phosphor-svelte/lib/Gear";`;
    expect(iconDepsIn(code, lookup).sort()).toEqual([
      "phosphor-svelte/lib/Gear",
      "phosphor-svelte/lib/X",
    ]);
  });
});

describe("customIcons", () => {
  it("reads every hand-drawn icon, with and without the Icon suffix", () => {
    const source = readFileSync(new URL("./icons/index.ts", import.meta.url), "utf8");
    const icons = customIcons(source, "/icons");
    expect(icons.get("IssueOpened")).toBe("/icons/IssueOpened.svelte");
    expect(icons.get("IssueOpenedIcon")).toBe("/icons/IssueOpened.svelte");
    expect(icons.get("GitPullRequestClosed")).toBe("/icons/GitPullRequestClosed.svelte");
    expect(icons.has("X")).toBe(false);
  });
});

describe("trimWeights", () => {
  const icon = [
    `{#if weight === "bold"}<path d="b"/>`,
    `{:else if weight === "duotone"}<path d="d"/>`,
    `{:else if weight === "fill"}<path d="f"/>`,
    `{:else if weight === "regular"}<path d="r"/>`,
    `{:else}{error}{/if}`,
  ].join("\n");

  it("keeps the weights asked for", () => {
    const out = trimWeights(icon, ["regular", "bold", "fill"]);
    expect(out).toContain(`d="b"`);
    expect(out).toContain(`d="f"`);
    expect(out).toContain(`d="r"`);
    expect(out).not.toContain(`d="d"`);
  });

  it("drops the first branch too, leaving the error for an unsupported weight", () => {
    const out = trimWeights(icon, ["regular"]);
    expect(out).not.toContain(`d="b"`);
    expect(out.startsWith('{#if false}{:else if weight === "regular"}')).toBe(true);
    expect(out).toContain("{:else}{error}{/if}");
  });

  it("trims a real Phosphor icon to something that still has its regular path", () => {
    const src = readFileSync(
      new URL("../node_modules/phosphor-svelte/lib/X.svelte", import.meta.url),
      "utf8",
    );
    const out = trimWeights(src, ["regular"]);
    expect(out.length).toBeLessThan(src.length);
    expect(out).toContain(`weight === "regular"`);
    expect(out).not.toContain(`weight === "thin"`);
  });
});

describe("parseGlyph", () => {
  const exists = (icon: string) => ["Star", "X", "TrafficLight"].includes(icon);

  it("reads the weight from the name's suffix, the app's weights without one", () => {
    expect(parseGlyph("Star", exists)).toEqual({ icon: "Star", weight: null });
    expect(parseGlyph("StarRegular", exists)).toEqual({ icon: "Star", weight: "regular" });
    expect(parseGlyph("StarFill", exists)).toEqual({ icon: "Star", weight: "fill" });
    expect(parseGlyph("XBold", exists)).toEqual({ icon: "X", weight: "bold" });
    expect(parseGlyph("StarDuotone", exists)).toEqual({ icon: "Star", weight: "duotone" });
  });

  it("lets an icon whose own name ends in a weight be itself", () => {
    expect(parseGlyph("TrafficLight", exists)).toEqual({ icon: "TrafficLight", weight: null });
    expect(parseGlyph("TrafficLightBold", exists)).toEqual({
      icon: "TrafficLight",
      weight: "bold",
    });
  });

  it("knows no other names", () => {
    expect(parseGlyph("Nope", exists)).toBeNull();
    expect(parseGlyph("NopeFill", exists)).toBeNull();
    expect(parseGlyph("StarHeavy", exists)).toBeNull();
  });
});

describe("glyphFromMarkup", () => {
  it("keeps a lone bare path's data only", () => {
    expect(glyphFromMarkup(`\n  <path d="M1,2Z"/>\n`)).toBe("M1,2Z");
    expect(glyphFromMarkup(`<path d="M1,2Z"></path>`)).toBe("M1,2Z");
  });

  it("keeps anything else as markup, without the blank square, comments or spaces", () => {
    const ssr = `<!----><rect width="256" height="256" fill="none"></rect><!--[-->\n<circle r="2"></circle> <path d="M1Z"></path><!--]-->`;
    expect(glyphFromMarkup(ssr)).toBe(`<circle r="2"></circle><path d="M1Z"></path>`);
    const duotone = `<path d="A" opacity="0.2"/><path d="B"/>`;
    expect(glyphFromMarkup(duotone)).toBe(duotone);
  });
});

describe("phosphorGlyph", () => {
  const star = readFileSync(`${LIB}Star.svelte`, "utf8");

  it("reads every weight of a real icon, the first branch and the last", () => {
    for (const weight of ["thin", "light", "regular", "bold", "fill"])
      expect(phosphorGlyph(star, weight)).toMatch(/^M[\d.,\-a-zA-Z ]+$/);
    expect(phosphorGlyph(star, "bold")).toBe(
      /weight === "bold"\}\s*<path d="([^"]+)"\/>/.exec(star)?.[1],
    );
    expect(phosphorGlyph(star, "duotone")).toMatch(/^<path d="[^"]+" opacity="0.2"\/><path d=/);
    expect(phosphorGlyph(star, "heavy")).toBeNull();
  });

  it("finds every weight of every Phosphor icon", () => {
    const icons = phosphorIcons(LIB);
    expect(icons.length).toBeGreaterThan(1500);
    expect(icons).not.toContain("IconContext");
    expect(icons.some((i) => i.endsWith("Icon"))).toBe(false);
    for (const icon of icons) {
      const source = readFileSync(`${LIB}${icon}.svelte`, "utf8");
      for (const weight of ["thin", "light", "regular", "bold", "fill", "duotone"])
        expect(phosphorGlyph(source, weight), `${icon} ${weight}`).toBeTruthy();
    }
  });
});

describe("glyphSvelte", () => {
  it("compiles several shapes into the template, a branch a weight, the fallback last", () => {
    const one = glyphSvelte({ bold: '<circle r="9"/>' })!;
    expect(one).toContain(
      'aria-hidden={hidden ?? (label ? undefined : "true")}><circle r="9"/></svg>',
    );
    expect(one).not.toContain("weight");
    const two = glyphSvelte({ regular: '<circle r="9"/>', fill: "M0Z" })!;
    expect(two).toContain(
      '{#if weight === "fill"}<path d="M0Z"/>{:else}<circle r="9"/>{/if}</svg>',
    );
  });

  it("refuses markup a template would read as an expression", () => {
    expect(glyphSvelte({ regular: "<text>{x}</text>" })).toBeNull();
  });
});

describe("rewriteGlyphImports", () => {
  const has = (name: string) => ["Star", "StarFill", "XBold", "IssueOpened"].includes(name);

  it("gives each glyph a module of its own, keeping renames", () => {
    expect(rewriteGlyphImports(`import { Star, StarFill as On } from "${G}";\nfoo();`, has)).toBe(
      `import Star from "${V}Star"; import On from "${V}StarFill";\nfoo();`,
    );
  });

  it("rewrites re-exports, multi-line lists and single quotes", () => {
    expect(rewriteGlyphImports(`export {\n  XBold,\n  Star as S,\n} from '${G}'`, has)).toBe(
      `export { default as XBold } from "${V}XBold"; export { default as S } from "${V}Star";`,
    );
  });

  it("drops types, and leaves type-only imports, strings and other modules alone", () => {
    expect(rewriteGlyphImports(`import { type GlyphData, Star } from "${G}";`, has)).toBe(
      `import Star from "${V}Star";`,
    );
    expect(rewriteGlyphImports(`import type { GlyphData } from "${G}";`, has)).toBeNull();
    expect(rewriteGlyphImports(`const s = "import { Star } from '${G}'";`, has)).toBeNull();
    expect(rewriteGlyphImports(`import { Star } from "${I}";`, has)).toBeNull();
  });

  it("refuses a name that is no glyph", () => {
    expect(() => rewriteGlyphImports(`import { Starr } from "${G}";`, has)).toThrow(/"Starr"/);
  });
});

describe("purr()", () => {
  it("allows purr's directory and the app's workspace, and excludes purr from prebundling", async () => {
    const [config] = purr();
    const hook = config.config as (c: object, e: object) => Record<string, any>;
    const out = hook({ root: new URL("..", import.meta.url).pathname }, { command: "serve" });
    expect(out.server.fs.allow).toHaveLength(2);
    expect(out.optimizeDeps.exclude).toEqual(["purr"]);
    // The site imports icons per file; those are prebundled up front.
    expect(out.optimizeDeps.include).toContain("phosphor-svelte/lib/MagnifyingGlass");
  });

  const glyphs = () => {
    const plugin = purr().find((p) => p.name === "purr:glyphs")!;
    return {
      resolve: plugin.resolveId as (id: string) => string | null,
      load: plugin.load as (id: string) => string | null,
    };
  };

  it("serves one glyph per module, Phosphor's and purr's own, at its weights", () => {
    const { resolve, load } = glyphs();
    const id = resolve(`${V}StarFill`)!;
    expect(id).toBe(`\0${V}StarFill`);
    const star = readFileSync(`${LIB}Star.svelte`, "utf8");
    const at = (w: string) => `${JSON.stringify(w)}:${JSON.stringify(phosphorGlyph(star, w))}`;
    const factory = new URL("./icons/glyph.ts", import.meta.url).pathname;
    expect(load(id)).toBe(glyphModule(JSON.parse(`{${at("fill")}}`), factory));
    expect(load(id)).toMatch(/^import \{ pathGlyph \} from ".*\/src\/icons\/glyph\.ts";\n/);
    expect(load(id)).toContain("export default /* @__PURE__ */ pathGlyph(");
    expect(load(`\0${V}Star`)).toContain(`Glyph({${at("regular")},${at("bold")},${at("fill")}})`);
    expect(load(`\0${V}IssueOpenedBold`)).toContain(
      `default /* @__PURE__ */ glyph({"bold":"<circle `,
    );
    expect(() => load(`\0${V}Starr`)).toThrow(/"Starr"/);
    expect(resolve("purr")).toBeNull();
  });

  it("sends a glyph of one path to glyph(), and one of several shapes to the svelte plugin", () => {
    const { resolve, load } = glyphs();
    expect(resolve(`${V}StarBold`)).toBe(`\0${V}StarBold`);
    const id = resolve(`${V}IssueOpened`)!;
    expect(id).toMatch(/\/src\/icons\/glyphs\/IssueOpened\.svelte$/);
    expect(load(id)).toContain('{#if weight === "bold"}');
    expect(resolve(`${V}StarDuotone`)).toMatch(/StarDuotone\.svelte$/);
  });

  it("serves every glyph to a namespace import of the whole module", () => {
    const { load } = glyphs();
    const all = load(new URL("./glyphs.js", import.meta.url).pathname)!;
    expect(all).toContain(`export const StarFill = /* @__PURE__ */ glyph({"fill":"`);
    expect(all).toContain(`export const Star = /* @__PURE__ */ glyph({"regular":"`);
    expect(all).toContain(`export const IssueOpenedDuotone = /* @__PURE__ */ glyph({"duotone":"<`);
    expect(all.split("\n").length).toBeGreaterThan(1500 * 7);
  });

  it("keeps the dependency scanner out of purr/icons and purr/glyphs", async () => {
    const [config] = purr();
    const resolveId = config.resolveId as (i: string, by?: string, o?: object) => Promise<unknown>;
    expect(await resolveId(G, undefined, { scan: true })).toEqual({ id: G, external: true });
    expect(await resolveId(I, undefined, { scan: true })).toEqual({ id: I, external: true });
  });

  it("prebundles purr's copy of Phosphor for an app that has none", async () => {
    const root = mkdtempSync(join(tmpdir(), "purr-app-"));
    writeFileSync(join(root, "package.json"), "{}");
    writeFileSync(join(root, "main.ts"), `import { X } from "${I}";\n`);
    const [config] = purr();
    const hook = config.config as (c: object, e: object) => Record<string, any>;
    const out = hook({ root }, { command: "serve" });
    expect(out.optimizeDeps.include).toContain("purr > phosphor-svelte/lib/X");
    expect(out.optimizeDeps.include).not.toContain("phosphor-svelte/lib/X");
  });

  it("gives an icon and its Icon-suffixed twin one module, so an app naming both ships one", () => {
    const plugin = purr().find((p) => p.name === "purr:icon-imports")!;
    const transform = plugin.transform as (code: string, id: string) => { code: string } | null;
    const out = transform(`import { XIcon, X } from "${I}";`, "/app/src/a.ts")!.code;
    expect(out).toBe(
      `import XIcon from "phosphor-svelte/lib/X"; import X from "phosphor-svelte/lib/X";`,
    );
  });

  it("serves a glyph a file imports, and refuses a name that is none", () => {
    const plugin = purr().find((p) => p.name === "purr:icon-imports")!;
    const transform = plugin.transform as (code: string, id: string) => { code: string } | null;
    expect(transform(`import { StarFill } from "${G}";`, "/app/src/a.ts")!.code).toBe(
      `import StarFill from "${V}StarFill";`,
    );
    expect(() => transform(`import { Starr } from "${G}";`, "/app/src/a.ts")).toThrow(/Starr/);
  });
});
