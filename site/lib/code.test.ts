import { describe, expect, it } from "vitest";
import { attribute, element, imports, storyCode } from "./code";
import { defineStory, initialArgs } from "./story";

const button = defineStory({
  title: "Button",
  group: "Controls",
  description: "",
  controls: {
    children: { type: "text", value: "Save" },
    icon: { type: "icon", optional: true },
    variant: {
      type: "select",
      options: ["default", "primary"],
      default: "default",
      value: "primary",
    },
    disabled: { type: "boolean", default: false },
    count: { type: "number", optional: true },
  },
  children: { text: "children", icon: "icon" },
  events: { onclick: "save" },
});

describe("attribute", () => {
  it("leaves defaults and unset values out", () => {
    expect(attribute("disabled", { type: "boolean", default: false }, false)).toBeNull();
    expect(attribute("round", { type: "boolean" }, false)).toBeNull();
    expect(attribute("open", { type: "boolean", required: true }, false)).toBe("open={false}");
    expect(attribute("label", { type: "text", optional: true }, "")).toBeNull();
    expect(attribute("size", { type: "select", options: ["md"], default: "md" }, "md")).toBeNull();
  });

  it("writes each kind the way Svelte does", () => {
    expect(attribute("disabled", { type: "boolean" }, true)).toBe("disabled");
    expect(attribute("open", { type: "boolean", default: true }, false)).toBe("open={false}");
    expect(attribute("count", { type: "number" }, 3)).toBe("count={3}");
    expect(attribute("label", { type: "text" }, "Save")).toBe('label="Save"');
    expect(attribute("label", { type: "text" }, 'Say "hi"')).toBe('label={"Say \\"hi\\""}');
    expect(attribute("icon", { type: "icon" }, "Gear")).toBe("icon={Gear}");
  });

  it("writes a choice by its code, and leaves it out without one", () => {
    const control = {
      type: "select" as const,
      options: [
        { label: "picture", value: "data:…", code: "picture" },
        { label: "list", value: [1] },
      ],
    };
    expect(attribute("src", control, "picture")).toBe('src="data:…"');
    expect(attribute("items", control, "list")).toBeNull();
  });
});

describe("element", () => {
  it("keeps a short element on one line", () => {
    expect(element("Kbd", ['hint="⌘K"'])).toBe('<Kbd hint="⌘K" />');
    expect(element("Button", [], "Save")).toBe("<Button>Save</Button>");
  });

  it("puts each attribute on its own line when it is long", () => {
    const attrs = [
      'label="A rather long label"',
      'hint="And a hint that goes on and on and on"',
      "disabled",
    ];
    expect(element("TextField", attrs)).toBe(
      '<TextField\n  label="A rather long label"\n  hint="And a hint that goes on and on and on"\n  disabled\n/>',
    );
  });
});

describe("imports", () => {
  it("sorts and dedupes, icons apart", () => {
    expect(imports(["Modal", "Button", "Button"], ["X"])).toBe(
      '<script lang="ts">\n  import { Button, Modal } from "purr";\n  import { X } from "purr\/icons";\n</script>',
    );
  });
});

describe("storyCode", () => {
  it("writes the controls' values, the content and the handlers", () => {
    const args = { ...initialArgs(button), icon: "FloppyDisk", disabled: true };
    expect(storyCode(button, args).split("\n\n")[1]).toBe(
      '<Button variant="primary" disabled onclick={save}><FloppyDisk /> Save</Button>',
    );
  });

  it("binds a synced prop and wraps an overlay in its condition", () => {
    const story = defineStory({
      title: "Sheet",
      group: "Overlays & menus",
      description: "",
      controls: { full: { type: "boolean", default: false }, label: { type: "text", value: "A" } },
      overlay: { close: "onclose" },
      events: { onclose: true, onexpand: { bind: "full", sync: () => ({}) } },
    });
    expect(storyCode(story, initialArgs(story)).split("\n\n")[1]).toBe(
      '{#if open}\n  <Sheet bind:full label="A" onclose={() => (open = false)} />\n{/if}',
    );
  });

  it("passes an optional handler only while it is on", () => {
    const story = defineStory({
      title: "Tag",
      group: "Display",
      description: "",
      controls: { label: { type: "text", value: "x" } },
      events: { onremove: { handler: "remove", optional: true } },
    });
    const off = initialArgs(story);
    expect(storyCode(story, off)).not.toContain("onremove");
    expect(storyCode(story, { ...off, onremove: true })).toContain("onremove={remove}");
  });
});
