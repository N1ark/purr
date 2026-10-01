import { describe, expect, it } from "vitest";

import { headingsIn, tocRows } from "./toc";

describe("tocRows", () => {
  it("measures depth from the shallowest heading and marks runs of children", () => {
    const rows = tocRows([
      { id: "a", title: "A", level: 2 },
      { id: "b", title: "B", level: 3 },
      { id: "c", title: "C", level: 3 },
      { id: "d", title: "D", level: 2 },
    ]);
    expect(rows.map((r) => r.depth)).toEqual([0, 1, 1, 0]);
    expect(rows.map((r) => r.hasChildren)).toEqual([true, false, false, false]);
    expect(rows.map((r) => r.afterChildren)).toEqual([false, false, false, true]);
  });

  it("is empty for no headings", () => {
    expect(tocRows([])).toEqual([]);
  });
});

describe("headingsIn", () => {
  it("reads headings in order, skipping ignored ones and naming the unnamed", () => {
    document.body.innerHTML = `
      <main>
        <h1 id="top">Title</h1>
        <nav><h2>Contents</h2></nav>
        <h2>Été  indien</h2>
        <h3 class="toc-ignore">Card</h3>
        <h2>Été indien</h2>
      </main>`;
    const items = headingsIn(document.querySelector("main")!);
    expect(items).toEqual([
      { id: "top", title: "Title", level: 1 },
      { id: "ete-indien", title: "Été indien", level: 2 },
      { id: "ete-indien-2", title: "Été indien", level: 2 },
    ]);
    expect(document.querySelectorAll("h2")[1].id).toBe("ete-indien");
  });

  it("leaves ids alone when asked to", () => {
    document.body.innerHTML = "<h2>One</h2><h2 id='two'>Two</h2>";
    expect(headingsIn(document.body, { assignIds: false })).toEqual([
      { id: "two", title: "Two", level: 2 },
    ]);
    expect(document.querySelector("h2")!.id).toBe("");
  });
});
