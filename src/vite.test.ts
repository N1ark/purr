// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { customIcons, iconDepsIn, purr, rewriteIconImports, trimWeights } from "./vite";

// Spelled out of parts: the playground config's own `purr()` would otherwise rewrite the fixtures.
const I = ["purr", "icons"].join("/");

const lookup = (name: string) =>
  name === "IssueOpened"
    ? "/purr/src/icons/IssueOpened.svelte"
    : ["X", "Gear", "CaretDownIcon", "IconContext"].includes(name)
      ? `phosphor-svelte/lib/${name}`
      : null;

describe("rewriteIconImports", () => {
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

describe("purr()", () => {
  it("allows purr's directory and the app's workspace, and excludes purr from prebundling", async () => {
    const [config] = purr();
    const hook = config.config as (c: object, e: object) => Record<string, any>;
    const out = hook({ root: new URL("..", import.meta.url).pathname }, { command: "serve" });
    expect(out.server.fs.allow).toHaveLength(2);
    expect(out.optimizeDeps.exclude).toEqual(["purr"]);
    // Purr's own components import icons per file; those are prebundled up front.
    expect(out.optimizeDeps.include).toContain("phosphor-svelte/lib/XIcon");
  });
});
