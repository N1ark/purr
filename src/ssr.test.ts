// @vitest-environment node
// A server-rendered page imports purr on a server: no `window`, `document` or storage. The
// barrel must load there, and every component must render to HTML without touching them.
import { createRawSnippet, type Component } from "svelte";
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

const text = (html: string) => createRawSnippet(() => ({ render: () => html }));
const item = createRawSnippet((entry: () => unknown) => ({
  render: () => `<span>${String(entry())}</span>`,
}));
const noop = () => {};
// Each component takes its own props; here they are only data to hand over.
type AnyComponent = Component<Record<string, unknown>>;

const PROPS: Record<string, Record<string, unknown>> = {
  ActionSheet: { open: true, title: "Act", actions: [{ label: "One", run: noop }], onclose: noop },
  Avatar: { name: "Ada Lovelace" },
  AvatarStack: { people: [{ name: "Ada" }, { name: "Grace" }] },
  Badge: { count: 3 },
  Banner: { title: "Offline" },
  Button: { children: text("<span>Save</span>") },
  Callout: { children: text("<p>Note</p>"), title: "Note", icon: text("<i></i>") },
  Checkbox: { checked: true, label: "On" },
  Chip: { label: "Unread", on: true },
  ColorGrid: { colors: ["#f00"], value: null, onpick: noop },
  CommandPalette: { items: [{ id: "a", label: "Open" }], onclose: noop },
  ConfirmButton: { confirmLabel: "Sure?", onconfirm: noop, children: text("<span>x</span>") },
  ContextMenuHost: {},
  DialogHost: {},
  EmptyState: { text: "Nothing" },
  Field: { label: "Name", children: text("<input>") },
  Footnote: { id: "1", children: text("<p>Aside</p>") },
  FootnoteRef: { id: "1" },
  Heading: { level: 2, id: "intro", children: text("<span>Intro</span>") },
  Highlight: { text: "hello", indices: [0, 1] },
  IconButton: { label: "Close", children: text("<svg></svg>") },
  Kbd: { hint: "Mod+K" },
  Lightbox: { items: [{ src: "/a.png", alt: "A" }], onclose: noop },
  LiveRegion: { message: "Saved" },
  Masonry: { items: [1, 2, 3], ratio: () => 1, item },
  Menu: { items: [{ label: "Copy", run: noop }], onclose: noop, x: 0, y: 0 },
  MonthGrid: { year: 2026, month: 9, today: "2026-10-05", day: item, actions: item },
  MonthScroller: { year: 2026, month: 9, today: "2026-10-05", day: item, actions: item },
  DatePicker: { value: "2026-10-05", today: "2026-10-05", onpick: noop },
  TimePicker: { value: "09:30", onpick: noop, noneLabel: "No time" },
  Modal: { label: "Dialog", onclose: noop, children: text("<p>Body</p>") },
  PanelHeader: { title: "Panel" },
  Popover: { open: true, onclose: noop, children: text("<p>Pop</p>") },
  PresenceDot: { state: "active" },
  ProgressRing: { value: 1, max: 2 },
  ResizeEdge: { side: "right", width: 200, onresize: noop },
  SearchInput: { value: "" },
  Segmented: { options: [{ value: "a", label: "A" }], value: "a", label: "Pick" },
  SettingGroup: { title: "General", children: text("<div></div>") },
  SettingRow: { label: "Theme", children: text("<div></div>") },
  SettingsLayout: { groups: [], current: "", onselect: noop, children: text("<div></div>") },
  Sheet: { open: true, onclose: noop, children: text("<div></div>") },
  ShortcutList: { groups: [] },
  ShortcutsOverlay: { groups: [], onclose: noop },
  Spinner: {},
  Switch: { checked: true, label: "On" },
  TableOfContents: { items: [{ id: "a", title: "A", level: 2 }], title: "Contents" },
  Tag: { label: "design", color: "#61afef", onclick: noop, pressed: true },
  TextArea: { value: "" },
  TextField: { value: "" },
  ThemeScript: { storageKey: "theme" },
  ToastHost: {},
  Twisty: { open: true },
  VirtualList: { items: [1, 2], rowHeight: 20, row: item },
};

describe("on a server", async () => {
  const purr = (await import("./index")) as Record<string, unknown>;
  const components = Object.keys(PROPS);

  it("loads the barrel, and covers every component", () => {
    // Capitalised exports are components, but for one class.
    const exported = Object.keys(purr).filter(
      (name) => /^[A-Z][a-z]/.test(name) && name !== "Updater",
    );
    expect(exported.sort()).toEqual(components.sort());
  });

  it.each(components)("renders %s", (name) => {
    const component = purr[name] as AnyComponent;
    expect(() => render(component, { props: PROPS[name] })).not.toThrow();
  });

  it("renders the markup a page is read in", () => {
    const { body } = render(purr.TableOfContents as AnyComponent, {
      props: PROPS.TableOfContents,
    });
    expect(body).toContain('<a href="#a"');
  });

  it("writes the theme script into the head", () => {
    const { head } = render(purr.ThemeScript as AnyComponent, {
      props: { storageKey: "theme" },
    });
    expect(head).toContain("<script>(function");
    expect(head).toContain('"theme"');
  });
});
