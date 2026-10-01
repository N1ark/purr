// @vitest-environment node
import { describe, expect, it } from "vitest";

import { PURPLE, TILE, composeIcon, composeTray } from "./app-icon";

const GLYPH = `<path class="line" d="M430 230 V794"/><circle class="fill" cx="600" cy="512" r="78"/><circle class="cut" cx="600" cy="512" r="34"/>`;

describe("composeIcon", () => {
  it("puts the glyph on the tile with the family's light and marks", () => {
    const svg = composeIcon(GLYPH, { title: "legit" });
    expect(svg).toContain(`<title>legit</title>`);
    expect(svg).toContain(`rx="${TILE.radius}"`);
    expect(svg).toContain(`stop-color="${PURPLE.from}"`);
    expect(svg).toContain(".line{fill:none;stroke:#fff;stroke-width:44");
    expect(svg).toContain(`.cut{fill:${PURPLE.mid}}`);
    expect(svg).toContain(GLYPH);
  });

  it("takes other colours, the cut-out following the middle one", () => {
    const svg = composeIcon(GLYPH, { colors: { from: "#111111", mid: "#222222", to: "#333333" } });
    expect(svg).toContain(".cut{fill:#222222}");
    expect(svg).not.toContain(PURPLE.mid);
  });
});

describe("composeTray", () => {
  const svg = composeTray(GLYPH);

  it("draws the glyph in black, cropped to the tile", () => {
    expect(svg).toContain(`viewBox="${TILE.inset} ${TILE.inset} ${TILE.size} ${TILE.size}"`);
    expect(svg).toContain(".line{fill:none;stroke:#000");
    expect(svg).not.toContain("#fff;");
  });

  it("turns each cut-out into a hole in the mask, and nothing else", () => {
    const mask = /<mask[\s\S]*<\/mask>/.exec(svg)?.[0] ?? "";
    expect(mask).toContain(`class="cut" cx="600" cy="512" r="34" style="display:inline;fill:#000"`);
    expect(mask).not.toContain('class="line"');
    expect(mask).not.toContain('class="fill"');
  });
});
