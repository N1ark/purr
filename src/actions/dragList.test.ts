import { describe, expect, it } from "vitest";

import { moveItem } from "../lib/util";
import { dragList, dropIndex, kindOf, ownedRow, ownsRow } from "./dragList";

/** What the list actually looks like after dropping item `from` over `over`. */
function drop(list: string[], from: number, over: number, after: boolean): string[] {
  return moveItem(list, from, dropIndex(from, over, after));
}

const L = ["a", "b", "c", "d"];

describe("dropIndex", () => {
  it("drops above a row it was released on the top half of", () => {
    expect(drop(L, 3, 1, false)).toEqual(["a", "d", "b", "c"]);
  });

  it("drops below a row it was released on the bottom half of", () => {
    expect(drop(L, 3, 1, true)).toEqual(["a", "b", "d", "c"]);
  });

  it("accounts for the source being removed first when moving down", () => {
    expect(drop(L, 0, 2, true)).toEqual(["b", "c", "a", "d"]);
    expect(drop(L, 0, 2, false)).toEqual(["b", "a", "c", "d"]);
  });

  it("is a no-op when dropping either side of itself", () => {
    expect(dropIndex(1, 1, false)).toBe(1);
    expect(dropIndex(1, 1, true)).toBe(1);
  });

  it("can move an item to the very end", () => {
    expect(drop(L, 0, 3, true)).toEqual(["b", "c", "d", "a"]);
  });

  it("can move an item to the very start", () => {
    expect(drop(L, 3, 0, false)).toEqual(["d", "a", "b", "c"]);
  });
});

/** Nesting bites: the channel list lives inside the draggable channels section. */
describe("nested lists", () => {
  function build() {
    document.body.innerHTML = `
      <div id="outer">
        <div id="section" data-dnd-index="0">
          <span data-dnd-handle>grip</span>
          <div id="inner">
            <div id="channel" data-dnd-index="0"></div>
          </div>
        </div>
      </div>`;
    const outer = document.getElementById("outer")!;
    const inner = document.getElementById("inner")!;
    return {
      outer,
      inner,
      section: document.getElementById("section")!,
      channel: document.getElementById("channel")!,
    };
  }

  it("claims only the rows directly inside it", () => {
    const { outer, inner, section, channel } = build();
    const a = dragList(outer, { group: "section", handle: true });
    const b = dragList(inner, { group: "channel" });

    expect(ownsRow(outer, section)).toBe(true);
    expect(ownsRow(outer, channel)).toBe(false);
    expect(ownsRow(inner, channel)).toBe(true);

    a.destroy();
    b.destroy();
  });

  it("makes both lists' rows draggable, each owning its own", () => {
    const { outer, inner, section, channel } = build();
    // Inner first, so the outer list's own sync() runs last and could clobber.
    const b = dragList(inner, { group: "channel" });
    const a = dragList(outer, { group: "section", handle: true });

    // A handled row stays draggable and refuses the drag in `dragstart`
    // instead: WebKit reads the flag before the event reaches us, so flipping
    // it on pointerdown meant nothing in the sidebar could be dragged at all.
    expect(channel.draggable).toBe(true);
    expect(section.draggable).toBe(true);

    a.destroy();
    b.destroy();
  });

  it("finds its own row under something belonging to a nested list", () => {
    const { outer, inner, section, channel } = build();
    const a = dragList(outer, { group: "section", handle: true });
    const b = dragList(inner, { group: "channel" });

    // The pointer is over a channel row inside another block: the block is
    // still what a section drag is being dropped onto.
    expect(ownedRow(outer, channel)).toBe(section);
    expect(ownedRow(inner, channel)).toBe(channel);
    // Nothing above either list is a row.
    expect(ownedRow(outer, document.body)).toBeNull();

    a.destroy();
    b.destroy();
  });

  it("stops claiming rows once destroyed", () => {
    const { outer, section } = build();
    dragList(outer, { group: "section" }).destroy();
    expect(ownsRow(outer, section)).toBe(false);
  });
});

/** The sidebar mutates constantly for reasons unrelated to ordering — badges, topics. */
describe("two orderings in one list", () => {
  /** The channel list: folder headings with the channels filed under them. */
  function build() {
    document.body.innerHTML = `
      <div id="list">
        <div id="f0" data-dnd-index="0" data-dnd-kind="folder" data-dnd-target="1">
          <span id="fname">Research</span>
        </div>
        <div id="c0" data-dnd-index="0"><span id="label">soteria</span></div>
        <div id="f1" data-dnd-index="1" data-dnd-kind="folder" data-dnd-target="2"></div>
        <div id="c1" data-dnd-index="1"></div>
      </div>`;
    const list = document.getElementById("list")!;
    const pick = (id: string) => document.getElementById(id)!;
    return {
      list,
      f0: pick("f0"),
      f1: pick("f1"),
      c0: pick("c0"),
      c1: pick("c1"),
      fname: pick("fname"),
      label: pick("label"),
    };
  }

  it("names the ordering a row belongs to, unmarked rows being the ordinary one", () => {
    const { f0, c0 } = build();
    expect(kindOf(f0)).toBe("folder");
    expect(kindOf(c0)).toBe("");
  });

  it("looks past the other ordering's rows", () => {
    const { list, f0, c0, label, fname } = build();
    const a = dragList(list, { group: "channel" });

    // A channel drag sees channels; a folder drag sees folders. Neither can
    // land on the other, which is what keeps a folder from being dropped
    // between two channels.
    expect(ownedRow(list, label)).toBe(c0);
    expect(ownedRow(list, label, "folder")).toBeNull();
    expect(ownedRow(list, fname, "folder")).toBe(f0);
    expect(ownedRow(list, fname)).toBeNull();

    a.destroy();
  });

  it("makes every row of both orderings draggable", () => {
    const { list, f0, f1, c0, c1 } = build();
    const a = dragList(list, { group: "channel" });
    for (const row of [f0, f1, c0, c1]) expect(row.draggable).toBe(true);
    a.destroy();
  });
});

describe("keeping draggable in step with the DOM", () => {
  const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

  function list() {
    document.body.innerHTML = `<div id="list"><div data-dnd-index="0"></div></div>`;
    const node = document.getElementById("list")!;
    return { node, handle: dragList(node, { group: "g" }) };
  }

  it("makes a row added later draggable", async () => {
    const { node, handle } = list();
    const row = document.createElement("div");
    row.dataset.dndIndex = "1";
    node.appendChild(row);

    await frame();
    expect(row.draggable).toBe(true);
    handle.destroy();
  });

  it("finds a row added inside a wrapper", async () => {
    const { node, handle } = list();
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div data-dnd-index="1"></div>`;
    node.appendChild(wrap);

    await frame();
    expect(node.querySelector<HTMLElement>('[data-dnd-index="1"]')!.draggable).toBe(true);
    handle.destroy();
  });

  it("ignores a mutation that moves no row", async () => {
    const { node, handle } = list();
    const row = node.firstElementChild as HTMLElement;
    // What an unread badge looks like from here.
    row.appendChild(document.createElement("span"));
    row.draggable = false;

    await frame();
    // Untouched: the rescan that would have reset it never ran.
    expect(row.draggable).toBe(false);
    handle.destroy();
  });

  it("stops rescanning once destroyed", async () => {
    const { node, handle } = list();
    handle.destroy();
    const row = document.createElement("div");
    row.dataset.dndIndex = "1";
    node.appendChild(row);

    await frame();
    expect(row.draggable).toBe(false);
  });
});
