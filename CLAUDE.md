# Purr — notes for Claude

Purr is the shared UI layer of three Svelte 5 + Tauri 2 apps: `../dagobert` (DAG notes),
`../legit` (git commit editor) and `../better-zulip` (Tulip, a Zulip client). It holds the
components, actions, small utilities, icons and styling they would otherwise each reimplement.
Goals, in order: consistency, performance, reusability. It is opinionated on purpose.

## How apps consume it

- Dependency: a pinned tag, `"purr": "github:N1ark/purr#v0.1.0"`. Purr ships **source**
  (`.svelte`, `.ts`, `.css`); there is no build step. The app's Vite + `vite-plugin-svelte`
  compile it. To work on purr inside an app, `npm link ../purr` there; `npm install` undoes it.
- `vite.config`: add the `purr()` plugin from `purr/vite` (serves purr's source when linked,
  rewrites `purr/icons` imports to per-file ones, trims unused Phosphor weights).
- Entry: `import "purr/fonts.css"; import "purr/styles.css";` then the app's own CSS.
- Imports: components/actions/utilities from `"purr"`, icons from `"purr/icons"`.

## Setup gotchas

- **Two copies of Svelte's types, when linked.** A linked purr has its own `node_modules/svelte`
  (a dev dependency), so svelte-check can see two `Snippet` types ("Two different types with this name exist"). Fix in the
  app's `tsconfig.json`: `"paths": { "svelte": ["./node_modules/svelte"], "svelte/*":
["./node_modules/svelte/*"] }` and `"typeRoots": ["./node_modules", "./node_modules/@types"]`.
  At runtime `vite-plugin-svelte` dedupes Svelte, so there is only ever one.
- **Types a type-aware linter must see live in `.ts` files** (`components/types.ts`), not in a
  `.svelte` module script; components re-export them.
- **`purr/vite` stays plain JavaScript** (`vite.js`, typed by JSDoc, with `vite.d.ts` for apps):
  Node loads it from `node_modules`, where it refuses to strip TypeScript types.
- **An installed purr is type-checked by the app**, under the app's compiler options: keep purr
  clean under `strict` and an `ES2022` target.

## Commands

```sh
npm run dev      # the catalog site on http://localhost:1430 — every component, live props
npm run build:site  # into dist-site/; BASE=/purr/ for GitHub Pages (site.yml does that on main)
npm run check    # svelte-check, must be 0 errors / 0 warnings
npm test         # vitest, colocated src/**/*.test.ts
npm run format   # prettier
```

## Layout

| Path              | What it is                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts`    | The barrel: every component, action and utility is exported from here                                                              |
| `src/styles/`     | `tokens.css` (the contract), `base.css`, `classes.css`, `markdown.css`, `code.css`, `fonts.css`; `index.css` imports all but fonts |
| `src/components/` | Svelte components, PascalCase, one per file                                                                                        |
| `src/actions/`    | Svelte actions (`use:tooltip`, `use:dragList`, …)                                                                                  |
| `src/lib/`        | Plain TS utilities and `.svelte.ts` rune state (overlays, menu, theme)                                                             |
| `src/icons/`      | `index.ts` re-exports all of `phosphor-svelte` plus purr's hand-drawn icons                                                        |
| `src/vite.js`     | The `purr()` Vite plugin                                                                                                           |
| `site/`           | The catalog: one `stories/*.ts` per component (controls, events, examples), hand-written pages; not shipped                        |

## Releases

- Every change an app would notice gets a line under `## Unreleased` in `CHANGELOG.md`, written
  for the app author. Anything that breaks an app on upgrade is marked **Breaking** and says what
  to change; until 1.0 that means a minor bump, otherwise a patch.
- `npm run release -- X.Y.Z` on a clean `main` checks, bumps, dates the section, commits
  `Release X.Y.Z` and tags `vX.Y.Z`; `git push --follow-tags` publishes it (`release.yml` turns the
  tag into a GitHub release). Never move or delete a tag an app may pin.

## Rules

- **Tokens, always.** A literal colour, radius, font size, duration or `z-index` in a component
  is a bug: it breaks a theme, opts out of density, or paints in the wrong order. Names are in
  `src/styles/tokens.css`; add a token there rather than a literal anywhere else.
- **Themes**: light is `:root`, dark is `html.dark`. `lib/theme.ts` sets the class (and follows
  the system when asked to). Never `@media (prefers-color-scheme)` in a component.
- **Bare elements are reset, not styled.** A bare `<button>` is unstyled; a button that looks
  like one is `.btn` (`.btn--primary`, `.btn--ghost`, `.btn--danger`, `.btn--icon`, `.btn--link`)
  or the `Button`/`IconButton` component. State classes: `.is-current` (selected in navigation),
  `.is-on` (engaged toggle), `.is-cursor` (keyboard cursor). `active` is never a selection.
- **No user-facing strings baked in.** Anything a component shows is a prop; an English default is
  fine, but it must be overridable (dagobert localises everything, Tulip writes British English).
- **No hard Tauri dependency.** Legit's UI has no `@tauri-apps/api`. Detect Tauri with
  `IS_TAURI` from `lib/env.ts`; anything that needs the API takes it as an argument or imports it
  dynamically behind that check.
- **Escape and click-outside go through `registerOverlay()`** (`lib/overlays.svelte.ts`), never a
  component's own `svelte:window onkeydown`, so only the topmost overlay closes.
- **Hot paths**: a component that can render once per row (Icon, Avatar, Badge, rows) carries no
  `svelte:window` listener, `ResizeObserver`, `getComputedStyle` or `Intl` construction. Lists
  longer than a screenful use `VirtualList`. Large collections are `$state.raw`.
- **Motion is decoration**: animate `transform`/`opacity`, never layout; `prefers-reduced-motion`
  is flattened globally in `base.css`.
- **Accessibility**: state shown by colour is also stated (`aria-current`, `aria-pressed`,
  `aria-expanded`); anything reachable by hover is reachable by focus; menus walk with arrows.
- **Touch**: `body.mobile` (set by `applyPlatform({ mobile })`) enlarges targets via `--btn`/`--row-h`;
  hover styling sits under `@media (hover: hover)`.
- **Components**: Svelte 5 runes only, `<script lang="ts">`, one `interface Props` destructured
  once from `$props()`, callbacks as `onx` props, content as snippets. Scoped styles; `:global`
  only for content the component does not own.
- **Pure logic gets a test**, colocated (`fuzzy.ts` → `fuzzy.test.ts`).
- **Every export shows on the site**: a new component gets a `site/stories/<name>.ts`; a new
  action or utility a section on its `site/pages/` page.
- **Comments: one line**, only where the reason isn't obvious from the name.
- Formatting: prettier, `printWidth: 100`, double quotes.
