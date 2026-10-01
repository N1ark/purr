# purr

The shared interface of three Svelte 5 + Tauri 2 apps — [dagobert](https://github.com/N1ark/dagobert),
[legit](https://github.com/N1ark/legit) and [Tulip](https://github.com/N1ark/better-zulip):
components, actions, small utilities, icons and styling, so none of them reimplements a menu, a
modal or a token again. It is opinionated on purpose, and shipped as source: there is no build
step, the app's Vite compiles it.

**[Browse every component →](https://n1ark.github.io/purr/)** (light and dark, with live props)

## Use it in an app

```sh
npm install github:N1ark/purr#v0.1.0
```

```ts
// vite.config.ts
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { purr } from "purr/vite";

export default defineConfig({ plugins: [purr({ weights: ["regular", "bold"] }), svelte()] });
```

```ts
// main.ts, before the app's own CSS
import "purr/fonts.css";
import "purr/styles.css";
import { applyTheme } from "purr";

applyTheme({ mode: "system" });
```

```svelte
<script lang="ts">
  import { Button, menu } from "purr";
  import { Trash } from "purr/icons";
</script>

<Button
  variant="danger"
  oncontextmenu={(e) => menu.show(e, [{ label: "Delete", icon: Trash, danger: true, run }])}
>
  Delete
</Button>
```

The `purr()` plugin rewrites `purr/icons` imports to one file per icon and cuts the Phosphor
weights the app doesn't use. Loading `purr/vite` needs Node ≥ 22.18.

## Versions

Every release is a `vX.Y.Z` tag with a [GitHub release](https://github.com/N1ark/purr/releases)
whose notes are its [`CHANGELOG.md`](CHANGELOG.md) section. An app pins the tag it was built
against — `github:N1ark/purr#v0.1.0` — and moves when it chooses; `#semver:^0.1.0` follows the
newest compatible tag instead. Until 1.0, a minor version may break things, and the changelog
says what to change.

To cut one: add the changes under `## Unreleased` as you go, then on `main`

```sh
npm run release -- 0.2.0   # checks, bumps, dates the changelog, commits, tags v0.2.0
git push --follow-tags     # the tag publishes the GitHub release
```

## Working on purr

```sh
npm install
npm run dev      # the component site, http://localhost:1430
npm run check    # svelte-check, 0 errors and 0 warnings
npm test         # vitest
```

To try a change inside an app before releasing it, link the working copy and reinstall when done:

```sh
cd ../dagobert && npm link ../purr   # the app now uses ../purr live
npm install                          # back to the pinned version
```

While linked, purr's own `node_modules/svelte` can give svelte-check two `Snippet` types; the
apps' `tsconfig.json` maps `svelte` to their own copy to avoid it. See [`CLAUDE.md`](CLAUDE.md)
for the conventions purr holds itself and its components to.
