import { describe, expect, it } from "vitest";

import { confirmAction, dialog, promptText } from "./dialog.svelte";

describe("dialog", () => {
  it("resolves with the values on confirm", async () => {
    const answer = dialog.ask({
      title: "Rename",
      fields: [
        { name: "name", label: "Name", value: "old" },
        { name: "pin", label: "Pin", type: "checkbox" },
      ],
    });
    dialog.values.name = "new";
    dialog.confirm();
    expect(await answer).toEqual({ name: "new", pin: false });
    expect(dialog.open).toBe(false);
  });

  it("will not confirm with a required field empty", async () => {
    const answer = promptText("Topic", { label: "Topic" });
    dialog.confirm();
    expect(dialog.open).toBe(true);
    dialog.values.value = "  Hello ";
    dialog.confirm();
    expect(await answer).toBe("Hello");
  });

  it("resolves a cancelled question as no, and a stranded one as cancelled", async () => {
    const first = confirmAction("Delete?", { danger: true });
    expect(dialog.danger).toBe(true);
    const second = confirmAction("Really?");
    expect(await first).toBe(false);
    dialog.cancel();
    expect(await second).toBe(false);
  });
});
