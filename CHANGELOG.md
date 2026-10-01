# Changelog

What changed in each version of purr, newest first. Apps pin a version
(`"purr": "github:N1ark/purr#v0.1.0"`), so every entry says what an app gets, and anything that
breaks an app that upgrades is marked **Breaking** with what to change. `npm run release -- X.Y.Z`
turns the Unreleased section into a dated one and tags it.

## Unreleased

## 0.2.1 — 2026-10-01

### Added

- `purr-icon --favicon` writes the glyph alone as `favicon.svg`, purple in a light tab bar and
  white in a dark one; `--no-icon` skips the app icon when only that is wanted.

### Changed

- Marks, tray icons and favicons are cropped to the glyph itself (measured with resvg) rather
  than to the whole tile, so they fill the space they're given. `composeMark` takes a `box` and
  a `dark` colour, and `squareAround` makes the box.
- `@resvg/resvg-js` is an optional peer rather than a dependency, so apps no longer install it.
  `purr-icon` loads it when it runs and, if it's missing, says to add it for the session with
  `npm i --no-save @resvg/resvg-js`.

## 0.2.0 — 2026-10-01

### Changed

- Text in a picked colour stays readable whatever the colour: `.tag` and the new `.ink` (text in
  `--c`) keep the colour's hue and chroma and clamp its OKLCH lightness to `--ink-min`/`--ink-max`,
  which hold AA on the colour's own tint over every surface for any sRGB colour; `.ink-mark` does
  the same for glyphs at 3:1 (`--mark-min`/`--mark-max`). A test checks both across the colour
  space. Tags are no longer washed toward the text colour, so a saturated pick stays saturated.
- Inline code everywhere (any `code` outside a `pre`) has one style on the new
  `--code-inline-bg`, a shade off the page; only code blocks keep the near-black `--code-bg`.
  Apps can delete their own inline-code rules.

### Added

- App icons in one style, lifted from legit's. `purr/app-icon` composes the tile, light and marks
  around an app's glyph: `composeIcon` for the icon, `composeMark` for the glyph alone in one
  colour, `composeTray` for the menu-bar template. The `purr-icon` command writes an app's
  `icon.svg` and the `source.png` that `tauri icon` takes, plus the tray files with `--tray` and
  `mark.svg` with `--mark <colour>`. The family's glyphs (legit, dagobert, tulip, purr) are in
  `src/app-icons/`; the site's App icons page edits and previews them.

## 0.1.0 — 2026-10-01

The first release: what dagobert, legit and Tulip shared, in one place.

### Styling

- Tokens for colour (light on `:root`, dark on `html.dark`), type scale off `--font-size`,
  spacing, radii, motion and one z-index order; `tokens.test.ts` holds them to WCAG AA.
- A reset that leaves bare elements unstyled; shared classes (`.btn`, `.field-input`, `.row-item`,
  `.pill`, `.tag`, `.checkbox`, `.swatch`, `.surface`, `.truncate`, `.focus-frame`, …); `.md`
  prose with `.md--compact`; one syntax palette for highlight.js, Prism and Pygments; Inter and
  Fira Code (with its ligatures).

### Icons

- `purr/icons`: all of Phosphor plus purr's own (`GitPullRequestClosed`, `GitPullRequestUnknown`,
  `IssueOpened`, `DistributeHorizontal`, `DistributeVertical`), same props as Phosphor's.
- `purr/vite`: the `purr()` plugin rewrites icon imports per file and trims unused weights.

### Components

- Controls: `Button`, `IconButton`, `ConfirmButton`, `Chip`, `Segmented`, `Switch`, `Checkbox`.
- Fields: `SearchInput`, `Field`, `TextField`, `TextArea`, `ColorGrid`.
- Display: `Spinner`, `ProgressRing`, `Badge`, `Tag`, `Avatar`, `AvatarStack`, `PresenceDot`,
  `Twisty`, `EmptyState`, `Kbd`, `Highlight`, `LiveRegion`, `Banner`.
- Layout: `PanelHeader`, `SettingsLayout`, `SettingGroup`, `SettingRow`, `ResizeEdge`.
- Overlays: `Modal`, `Popover`, `Menu` and `ContextMenuHost`, `ActionSheet`, `Sheet`,
  `CommandPalette`, `Lightbox`, `DialogHost`, `ToastHost`, `ShortcutsOverlay`.
- Lists: `VirtualList`, with fixed or per-row heights.

### Actions and utilities

- Actions: `tooltip`, `dragList`, `focusTrap`, `autofocus`, `resizer`.
- One overlay stack for Escape and outside clicks; a keymap with chords and a generated help
  list; fuzzy ranking; `menu`, `dialog`, `toast` and `createUpdater` state; theme, density and
  accents; platform and keyboard-inset setup; time, colour, storage and clipboard helpers.
