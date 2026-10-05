# Changelog

What changed in each version of purr, newest first. Apps pin a version
(`"purr": "github:N1ark/purr#v0.1.0"`), so every entry says what an app gets, and anything that
breaks an app that upgrades is marked **Breaking** with what to change. `npm run release -- X.Y.Z`
turns the Unreleased section into a dated one and tags it.

## Unreleased

## 0.5.3 — 2026-10-05

### Changed

- Toasts lose their coloured left border: each is washed in its tone instead, as a callout is
  (`--toast-tint`, 9%), and an error or a success leads with a filled icon in its colour.

## 0.5.2 — 2026-10-05

### Fixed

- `MonthGrid` no longer squashes a full day's items to fit, cutting off their text: they keep
  their height and the day clips the last ones. Cap what a day shows (a "+2 more" item, as the
  catalog does) when the grid can be short.

## 0.5.1 — 2026-10-05

### Added

- `MonthGrid`: a month as six weeks of days, from the reader's first weekday, today marked with
  `aria-current="date"`. A `day` snippet fills each day and an `actions` snippet sits beside its
  number on hover; every day carries `data-day` for drag and drop, and `target` draws the one
  under a drag.
- Day keys, `YYYY-MM-DD` in local time: `dayKey`, `addDays`, `daysBetween`; and `monthGrid`,
  `firstWeekday`, `formatWeekday`, `formatMonth`.
- `formatDay` names the coming days too: `Tomorrow` (a new `tomorrow` label), then the weekday
  for the rest of the week. Past days read as before.

### Fixed

- `formatDay` reads a date-only string (`"2026-10-05"`) as that local day, not a UTC midnight
  that is the day before west of Greenwich.

## 0.5.0 — 2026-10-05

### Changed

- **Breaking**: the palette is written in OKLCH. Every colour token in `tokens.css` and every
  `ACCENTS` pair (so `accentSwatch`) is now an `oklch()` string. Code that read a token or an
  accent as hex (an `<input type="color">`, its own parser) runs it through
  `toHex(parseColor(value))` instead.
- The palette is rebalanced in OKLCH, so colours shift slightly. Every accent shares one
  lightness per role (fill, hover, and the same in dark), so no accent reads heavier than
  another. The status, diff and syntax colours each sit at one lightness per theme, and the
  greys are rounded to even steps. Every pairing the tests check is still AA.
- `Callout` drops its all-round tint for a title band: the title sits on a stronger tint
  (`--callout-head-tint`, 14%) above a paler body (`--callout-tint`, now 5%). `--callout-pad`
  now pads the body only.
- **Breaking**: `colorFromSeed(seed, chroma = 0.08, lightness = 0.5)` returns `oklch()` at one
  lightness for every hue, so no avatar reads heavier than its neighbour, white initials still
  AA. Its optional arguments were `saturation` and `lightness` in HSL percentages; a call that
  passed them passes OKLCH chroma and lightness (0–1). Avatars without a picture change colour.
- Tints (`color-mix()` in `accentVars`, `.tag`, `Callout`, `Menu`, `Modal`) mix in `oklab`.

### Added

- `parseColor` reads `oklch()` (lightness as a number or a percentage, alpha ignored, colours
  outside sRGB clipped), so `contrastRatio` and `readableOn` take the tokens as they are.
- `toOklch(rgb)`: `[lightness, chroma, hue]` for an sRGB triple.

## 0.4.0 — 2026-10-02

### Added

- Inline code with a language: `inlineCodeLang(text)` splits a code span ending in `{:lang}`
  (`` `Vec<u8>{:rust}` ``, rehype-pretty-code's spelling) into `{ code, lang }`, or `null` when it
  names none. Highlight `code` with the app's highlighter in the renderer's code span hook and
  `code.css` colours it as it does a block; the Markdown page has a marked example.

## 0.3.0 — 2026-10-01

### Changed

- **Breaking:** `styles.css` no longer assumes an app's fixed window, so a website can use purr.
  The rules that did moved to a new `purr/shell.css`: `html, body { height: 100%; overflow:
hidden }`, `#app { height: 100% }`, chrome (`button`, `kbd`, `time`, `label`, the ARIA
  roles) not selectable with `.md`/inputs/`.selectable` opting back in, and `body.mobile`'s
  no-select, no-callout, no-overscroll. **Apps: add `import "purr/shell.css";` right after
  `import "purr/styles.css";`** in `main.ts`; nothing else changes.
- The thin scrollbars apply to scrolling panes only (`body *`); the page's own scrollbar is the
  platform's, overlay on macOS. No difference inside an app's shell.
- `.unselectable` is a class of its own in `classes.css`, in a page or a shell.
- `applyTheme({ storageKey })` stores the mode too, and `bootTheme` honours it: a `system` choice
  is resolved afresh at boot instead of repeating what the system was last time.
- `Modal` (and so `Lightbox`, dialogs, palettes) holds the page still while open (`lockScroll`):
  in a page that scrolls, the wheel no longer moves the page behind the scrim.
- `.md` headings take their spacing and weight from `--md-heading-before`,
  `--md-heading-after` and `--md-heading-weight`; the defaults are what they were.
- `Tag` takes `pressed` with `onclick`: a filter that is on, as `aria-pressed` and ringed in its
  own ink.

### Added

- Server rendering: every module imports, and every component renders, under Node
  (`src/ssr.test.ts` holds them to it).
- `ThemeScript` and `themeScript(key)`: `bootTheme` as an inline `<head>` script, for a
  server-rendered page to paint the stored or system theme before the first frame.
  `storedThemeMode(key)` reads the choice back; `liveTheme` is the painted theme as a rune
  (`liveTheme.current`, `liveTheme.dark`). `readStoredTheme` is exported.
- `Callout`: an aside in running text, tinted by `tone` or `color`, with an optional `title` and
  `icon` (leading the title, or in the corner). Tuned by `--callout-tint`, `--callout-pad`,
  `--callout-border`, `--callout-shadow`.
- `TableOfContents`: headings as a nested rail of links, with `current` and `onselect`;
  `headingsIn(root)` reads them off rendered HTML (naming unnamed headings), `tocRows` is the
  layout, `uniqueSlug` the naming.
- `Heading`: a heading that links to itself, `#` in the margin on hover.
- `FootnoteRef` and `Footnote`: a note's mark and its text, linked both ways.
- `Masonry`: items of mixed heights in level columns (`packColumns`, `columnCount`), with CSS
  columns standing in until it has measured itself, so it renders on a server.
- `formatDate(input, { style, locale })`: a calendar date at the precision it was written with
  (`"2026"`, `"2026-07"`, `"2026-07-20"`), on its own day in every time zone; `isoDate` for the
  `datetime` attribute.
- `slugify`, and `lockScroll`.
- Speech-bubble icons Phosphor lacks, on its `chat-circle` and at its line weight in every weight:
  `ChatCircleQuestion`, `ChatCircleExclamation`, `ChatCircleCheck`, `ChatCircleX`,
  `ChatCircleHeart` and `ChatCircleCode`, to sit beside its `ChatCircleDots` and `ChatCircleText`.
- A tooltip can end with an icon: `use:tooltip={{ text, icon: ArrowSquareOut }}` (`iconProps` for
  its props), for a link that leaves the site.

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
