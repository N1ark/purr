// The site's own state: the route, the look (theme, density, accent, touch) and the props of the
// hosts mounted once in `App.svelte`, which a story may change.
import {
  ACCENTS,
  DEFAULT_ACCENT,
  applyPlatform,
  applyTheme,
  isMobile,
  persisted,
  systemTheme,
  type Density,
  type ResolvedTheme,
} from "purr";

const query = new URLSearchParams(location.search);

/**
 * Remembered across visits; `?theme=dark&density=cozy&accent=teal` wins for this visit only
 * (links, screenshots) without overwriting what was remembered.
 */
function remembered<T extends string>(key: string, initial: T, allowed: readonly string[]) {
  const stored = persisted<T>(`purr.site.${key}`, initial, (v): v is T =>
    allowed.includes(v as string),
  );
  const forced = query.get(key);
  let override = $state<T | null>(forced && allowed.includes(forced) ? (forced as T) : null);
  return {
    get value(): T {
      return override ?? stored.value;
    },
    set value(next: T) {
      override = null;
      stored.value = next;
    },
  };
}

export const look = {
  theme: remembered<ResolvedTheme>("theme", systemTheme(), ["light", "dark"]),
  density: remembered<Density>("density", "compact", ["compact", "cozy", "dense"]),
  accent: remembered<string>(
    "accent",
    DEFAULT_ACCENT,
    ACCENTS.map((a) => a.id),
  ),
};

export function paint() {
  applyTheme({ mode: look.theme.value, density: look.density.value, accent: look.accent.value });
}

// ---- touch sizing: `?mobile`, or a phone ----

let teardown = () => {};
export const touch = $state({ on: query.has("mobile") || isMobile });

export function setTouch(on: boolean) {
  touch.on = on;
  teardown();
  teardown = applyPlatform({ mobile: on });
  const url = new URL(location.href);
  if (on) url.searchParams.set("mobile", "");
  else url.searchParams.delete("mobile");
  history.replaceState(history.state, "", url.toString().replace("mobile=", "mobile"));
}

// ---- routing: `#/button` ----

const read = () => decodeURIComponent(location.hash.replace(/^#\/?/, ""));

export const route = $state({ path: read() });

addEventListener("hashchange", () => {
  route.path = read();
});

export const href = (slug: string) => `#/${slug}`;

// ---- hosts ----

export const hosts = $state({
  toast: { position: "bottom" as "bottom" | "bottom-end", dismissLabel: "Dismiss" },
});

export const REPO = "https://github.com/N1ark/purr";
export const sourceUrl = (path: string) => `${REPO}/blob/main/${path}`;
