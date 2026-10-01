// @ts-check
// The house style for app icons, lifted from legit's: a rounded tile on Apple's 1024 grid, a
// purple diagonal with a soft glow, grain and a rim, and a white mark drawn in a few strokes.
// An app supplies only the mark, a `glyph` in the 1024 space using the classes below; this module
// composes the rest. Plain JavaScript so Node (the `purr-icon` CLI) and the site can share it.

/**
 * The marks an icon is drawn with. Everything else in a glyph is up to the app, but these keep
 * three apps reading as one family: the same line weight, the same dot, the same faint step.
 */
export const GLYPH_CLASSES = {
  /** A line: the white stroke every mark is built from. */
  line: "fill:none;stroke:#fff;stroke-width:44;stroke-linecap:round;stroke-linejoin:round",
  /** A thinner line, for detail inside a shape. */
  thin: "fill:none;stroke:#fff;stroke-width:28;stroke-linecap:round;stroke-linejoin:round",
  /** A solid shape or dot. */
  fill: "fill:#fff",
  /** The secondary part of a mark: what moved, what is implied. */
  faint: "opacity:0.55",
  /** Punched back out of a white shape, in the tile's middle colour. */
  cut: "fill:var(--cut)",
};

/** The tile: Apple's macOS grid puts an 824 square at 100 in a 1024 canvas. */
export const TILE = { canvas: 1024, inset: 100, size: 824, radius: 185 };

/** The default colours: n1ark.com's purple, light to deep along the diagonal. */
export const PURPLE = { from: "#b045ab", mid: "#8a2aa2", to: "#451551" };

/**
 * @typedef {{ from: string, mid: string, to: string }} IconColors
 * @typedef {{ colors?: IconColors, title?: string }} IconOptions
 */

const css = (/** @type {string} */ cut) =>
  Object.entries(GLYPH_CLASSES)
    .map(([name, rule]) => `.${name}{${rule.replace("var(--cut)", cut)}}`)
    .join("");

/**
 * The full icon: tile, light and the glyph centred on the grid.
 * @param {string} glyph SVG markup in the 1024 space, using `GLYPH_CLASSES`.
 * @param {IconOptions} [options]
 * @returns {string}
 */
export function composeIcon(glyph, options = {}) {
  const { from, mid, to } = options.colors ?? PURPLE;
  const { canvas, inset, size, radius } = TILE;
  const title = options.title ? `<title>${options.title}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas} ${canvas}" width="${canvas}" height="${canvas}">${title}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.28" cy="0.2" r="0.75">
      <stop offset="0" stop-color="#fff" stop-opacity="0.28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.07"/></feComponentTransfer>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <clipPath id="tile"><rect x="${inset}" y="${inset}" width="${size}" height="${size}" rx="${radius}"/></clipPath>
    <style>${css(mid)}</style>
  </defs>
  <g clip-path="url(#tile)">
    <rect x="${inset}" y="${inset}" width="${size}" height="${size}" fill="url(#bg)"/>
    <rect x="${inset}" y="${inset}" width="${size}" height="${size}" fill="url(#glow)"/>
    <rect x="${inset}" y="${inset}" width="${size}" height="${size}" filter="url(#grain)"/>
  </g>
  <rect x="${inset + 0.5}" y="${inset + 0.5}" width="${size - 1}" height="${size - 1}" rx="${radius}" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="3"/>
  <g>${glyph}</g>
</svg>
`;
}

/**
 * @typedef {{ x: number, y: number, size: number }} MarkBox
 * @typedef {{ box?: MarkBox, dark?: string }} MarkOptions
 */

/**
 * A square crop around a glyph's bounds (as measured by resvg's `getBBox`), with a margin.
 * @param {{ x: number, y: number, width: number, height: number }} bounds
 * @param {number} [margin] Of the longer side.
 * @returns {MarkBox}
 */
export function squareAround(bounds, margin = 0.06) {
  const size = Math.max(bounds.width, bounds.height) * (1 + 2 * margin);
  const round = (/** @type {number} */ n) => Math.round(n * 10) / 10;
  return {
    x: round(bounds.x + bounds.width / 2 - size / 2),
    y: round(bounds.y + bounds.height / 2 - size / 2),
    size: round(size),
  };
}

const inkRules = (/** @type {string} */ color, /** @type {string} */ scope = "") =>
  Object.entries(GLYPH_CLASSES)
    .filter(([name]) => name !== "cut")
    .map(([name, rule]) => `${scope}.${name}{${rule.replaceAll("#fff", color)}}`)
    .join("");

/**
 * The glyph alone in one colour on nothing: for a toolbar, a login screen, a favicon. Faint parts
 * stay faint and cut-outs become holes. Cropped to the tile unless `box` says tighter; `dark` is
 * the colour to use instead under a dark colour scheme (a favicon's tab bar).
 * @param {string} glyph
 * @param {string} [color]
 * @param {MarkOptions} [options]
 * @returns {string}
 */
export function composeMark(glyph, color = "#fff", options = {}) {
  const { canvas } = TILE;
  const { x, y, size } = options.box ?? { x: TILE.inset, y: TILE.inset, size: TILE.size };
  const ink =
    inkRules(color) +
    (options.dark ? `@media (prefers-color-scheme:dark){${inkRules(options.dark)}}` : "");
  // Cut-outs become holes: drawn black in a mask (inline style beats `.cut{display:none}`).
  const cuts = (glyph.match(CUT_RE) ?? [])
    .map((tag) => tag.replace(/\/>$/, ' style="display:inline;fill:#000"/>'))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${size} ${size}" width="128" height="128">
  <defs>
    <style>${ink}.cut{display:none}</style>
    <mask id="cuts" maskUnits="userSpaceOnUse" x="0" y="0" width="${canvas}" height="${canvas}">
      <rect width="${canvas}" height="${canvas}" fill="#fff"/>${cuts}
    </mask>
  </defs>
  <g mask="url(#cuts)">${glyph}</g>
</svg>
`;
}

/**
 * The menu-bar template: the mark in black, which macOS reads only for its alpha.
 * @param {string} glyph
 * @param {MarkBox} [box]
 * @returns {string}
 */
export function composeTray(glyph, box) {
  return composeMark(glyph, "#000", { box });
}

/** A cut-out in a glyph: a self-closing shape whose class list includes `cut`. */
const CUT_RE = /<\w+\b[^>]*\bclass="[^"]*\bcut\b[^"]*"[^>]*\/>/g;
