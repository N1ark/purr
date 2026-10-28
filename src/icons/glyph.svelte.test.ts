// A glyph must draw exactly what its full icon draws, at every weight: the same shapes inside an
// `<svg>` of the same size, for Phosphor's icons (read from their source as the plugin does) and
// for purr's own (rendered once into `glyphs.json`).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { flushSync, mount, unmount, type Component } from "svelte";
import { describe, expect, it } from "vitest";
import {
  customIcons,
  GLYPH_WEIGHTS,
  glyphDeclarations,
  parseGlyph,
  phosphorGlyph,
  phosphorIcons,
} from "../vite";
import own from "./glyphs.json";
import * as ui from "./ui";
import { glyph } from "./glyph";
import {
  BookmarksSimpleFill,
  IssueOpened,
  IssueOpenedBold,
  Star,
  StarDuotone,
  StarFill as Filled,
} from "purr/glyphs";

// Each component takes its own props; here they are only data to hand over.
type AnyComponent = Component<any>;

// From the root rather than `import.meta.url`, which Vite would take for an asset's address here.
const LIB = join(process.cwd(), "node_modules/phosphor-svelte/lib");
const WEIGHTS = Object.keys(GLYPH_WEIGHTS);
const OWN = own as Record<string, Record<string, string>>;
const source = (icon: string) => readFileSync(`${LIB}/${icon}.svelte`, "utf8");

// Every weight kept: the playground's `purr()` trims the plain modules to three.
const phosphor = import.meta.glob<AnyComponent>(
  "../../node_modules/phosphor-svelte/lib/{Star,GitBranch,CaretLeft,CaretRight,Check,CheckCircle,Lightning,MagnifyingGlass,Minus,Plus,WarningCircle,X,CellSignalNone,BookmarksSimple,Stack,SpeakerSimpleX}.svelte",
  { query: "?weights=all", import: "default", eager: true },
);
const hand = import.meta.glob<AnyComponent>("./*.svelte", { import: "default", eager: true });
const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1, -".svelte".length);
const full = (name: string) =>
  Object.entries(phosphor).find(([path]) => nameOf(path) === name)?.[1] ?? hand[`./${name}.svelte`];

/** An element as markup with its attributes sorted: their order draws nothing. */
const canon = (el: Element): string =>
  `<${el.tagName} ${[...el.attributes]
    .map((a) => `${a.name}="${a.value}"`)
    .sort()
    .join(" ")}>${[...el.children].map(canon).join("")}</${el.tagName}>`;

/** The `<svg>` a component renders, and its shapes without the blank square icons start with. */
function draw(component: AnyComponent, props: Record<string, unknown>) {
  const target = document.createElement("div");
  const app = mount(component, { target, props });
  flushSync();
  const svg = target.querySelector("svg")!;
  const shapes = [...svg.children]
    .filter((el) => !(el.tagName === "rect" && el.getAttribute("fill") === "none"))
    .map(canon)
    .join("");
  const attrs = ["width", "height", "viewBox", "fill", "transform"].map((a) => svg.getAttribute(a));
  unmount(app);
  return { shapes, attrs, svg };
}

const same = (light: AnyComponent, Full: AnyComponent, props: Record<string, unknown>) => {
  const a = draw(light, props);
  const b = draw(Full, props);
  expect(a.shapes).toBe(b.shapes);
  expect(a.attrs).toEqual(b.attrs);
};

describe("a glyph draws what the full icon draws", () => {
  const sample = Object.keys(phosphor).map(nameOf);

  it.each(sample)("Phosphor's %s, at every weight", (name) => {
    for (const weight of WEIGHTS) {
      const light = glyph({ [weight]: phosphorGlyph(source(name), weight)! });
      same(light, full(name), { weight, size: 16 });
    }
  });

  it.each(Object.keys(OWN))("purr's %s, at every weight", (name) => {
    for (const weight of WEIGHTS) same(glyph(OWN[name]), full(name), { weight, mirrored: true });
  });

  it("purr's components' own, at their weight", () => {
    const exists = (icon: string) => !!full(icon);
    for (const [name, light] of Object.entries(ui)) {
      const { icon, weight } = parseGlyph(name, exists)!;
      same(light, full(icon), { weight, size: 12 });
    }
  });
});

describe("glyph()", () => {
  const Check = glyph({ bold: phosphorGlyph(source("Check"), "bold")! });

  it("is decorative unless labelled, and passes aria-hidden on", () => {
    const { svg } = draw(Check, {});
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.hasAttribute("role")).toBe(false);
    const named = draw(Check, { "aria-label": "Done" }).svg;
    expect(named.getAttribute("role")).toBe("img");
    expect(named.getAttribute("aria-label")).toBe("Done");
    expect(named.hasAttribute("aria-hidden")).toBe(false);
    expect(draw(Check, { "aria-hidden": "false" }).svg.getAttribute("aria-hidden")).toBe("false");
  });

  it("is a 1em svg in the text's colour, unless told otherwise", () => {
    const { svg } = draw(Check, {});
    expect([svg.getAttribute("width"), svg.getAttribute("fill")]).toEqual(["1em", "currentColor"]);
    const tinted = draw(Check, { color: "red", class: "x", size: 10 }).svg;
    expect([tinted.style.color, tinted.getAttribute("class")]).toEqual(["red", "x"]);
    expect(tinted.getAttribute("width")).toBe("10");
    expect([...tinted.children].map((el) => el.outerHTML)).toEqual([
      `<path d="${phosphorGlyph(source("Check"), "bold")}"></path>`,
    ]);
  });

  it("follows a weight that changes, and falls back to regular, else the one it has", () => {
    const at = (w: string) => phosphorGlyph(source("Star"), w)!;
    const Both = glyph({ regular: at("regular"), fill: at("fill") });
    const props = $state<{ weight: "regular" | "fill" | "thin" }>({ weight: "regular" });
    const target = document.createElement("div");
    const app = mount(Both, { target, props });
    const d = () => target.querySelector("path")!.getAttribute("d");
    flushSync();
    expect(d()).toBe(at("regular"));
    props.weight = "fill";
    flushSync();
    expect(d()).toBe(at("fill"));
    props.weight = "thin";
    flushSync();
    expect(d()).toBe(at("regular"));
    unmount(app);
    expect(draw(glyph({ bold: at("bold") }), { weight: "fill" }).svg.innerHTML).toContain(
      at("bold"),
    );
  });
});

describe("purr/glyphs", () => {
  it("serves each glyph through the plugin: a bare name at the app's weights, a suffix alone", () => {
    const star = (weight: string) => phosphorGlyph(source("Star"), weight);
    const d = (c: AnyComponent, props = {}) => draw(c, props).svg.querySelector("path")?.outerHTML;
    // The playground keeps purr()'s default weights: regular, bold and fill.
    for (const weight of ["regular", "bold", "fill"])
      expect(d(Star, { weight })).toBe(`<path d="${star(weight)}"></path>`);
    expect(d(Star, { weight: "thin" })).toBe(`<path d="${star("regular")}"></path>`);
    expect(d(Filled)).toBe(`<path d="${star("fill")}"></path>`);
    expect(draw(StarDuotone, {}).svg.innerHTML).toContain('opacity="0.2"');
    expect(draw(BookmarksSimpleFill, {}).svg.querySelectorAll("path")).toHaveLength(2);
    same(IssueOpenedBold, full("IssueOpened"), { weight: "bold" });
    same(IssueOpened, full("IssueOpened"), { weight: "fill" });
  });

  it("covers purr's own icons, every one the icon barrel exports", () => {
    const index = readFileSync(join(process.cwd(), "src/icons/index.ts"), "utf8");
    const names = [...customIcons(index, "").keys()].filter((n) => !n.endsWith("Icon"));
    expect(Object.keys(OWN).sort()).toEqual(names.sort());
    for (const name of names) expect(Object.keys(OWN[name])).toEqual(WEIGHTS);
  });

  it("declares every icon, bare and at every weight (`npm run glyphs` rewrites it)", () => {
    const declared = readFileSync(join(process.cwd(), "src/glyphs.d.ts"), "utf8");
    const names = [...Object.keys(OWN), ...phosphorIcons(LIB)].sort();
    expect(declared).toBe(glyphDeclarations(names));
  });
});
