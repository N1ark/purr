import { describe, expect, it } from "vitest";
import { highlight } from "./highlight";

const strip = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

describe("highlight", () => {
  it("keeps every character, escaped", () => {
    const code = '<Button variant="primary" onclick={() => (n = n + 1 > 2 && true)}>Save</Button>';
    const html = highlight(code);
    expect(strip(html)).toBe(code);
    expect(html).not.toMatch(/<(?!\/?span)/);
  });

  it("marks tags, attributes, strings and keywords", () => {
    const html = highlight('<Kbd hint="⌘K" />');
    expect(html).toContain('<span class="hljs-name">Kbd</span>');
    expect(html).toContain('<span class="hljs-attr">hint</span>');
    expect(html).toContain(
      '<span class="hljs-string">&quot;⌘K&quot;</span>'.replace(/&quot;/g, '"'),
    );
    expect(highlight("import { x } from 'y';")).toContain(
      '<span class="hljs-keyword">import</span>',
    );
    expect(highlight("{#if open}")).toContain('<span class="hljs-keyword">{#if</span>');
    expect(highlight("// note")).toBe('<span class="hljs-comment">// note</span>');
    expect(highlight("createKeymap<Action>(b)")).not.toContain("hljs-name");
  });
});
